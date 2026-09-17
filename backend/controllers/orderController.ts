import crypto from 'crypto';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import type { RequestHandler } from "express";
import orderModel, { ORDER_STATUSES } from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import couponModel from "../models/couponModel.js";
import { priceCartServerSide, applyCoupon, decrementStock, rollbackStock, PricedLine } from '../utils/pricing.js';

// Global Variables
const currency = "inr"
const delivery_charges = 10

// GATEWAY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_SECRET_KEY as string
});

// Confirms every requested item still has enough stock right now — a fast
// pre-flight check before sending the buyer to a payment provider. The
// atomic decrement (the real source of truth) only happens on verified
// payment success, so this is advisory, not a reservation.
const preflightStockCheck = async (priced: PricedLine[]): Promise<void> => {
    for (const it of priced) {
        const product = await productModel.findById(it.productId);
        const variantEntry = product?.variants.find((v) => v.value === it.variant);
        if (!variantEntry || variantEntry.stock < it.quantity) {
            throw new Error(`${it.name} (${it.variant}) doesn't have enough stock right now.`);
        }
    }
};

// Placing Orders on COD — confirmed immediately, so stock decrements now.
const placeOrder: RequestHandler = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;

        const { itemsAmount, priced } = await priceCartServerSide(items);
        const { discount, coupon } = await applyCoupon(couponCode, userId, itemsAmount);
        await decrementStock(priced);

        const orderData = {
            userId,
            items: priced,
            itemsAmount,
            discount,
            couponCode: coupon ? coupon.code : undefined,
            deliveryFee: delivery_charges,
            amount: itemsAmount - discount + delivery_charges,
            address,
            paymentMethod: "COD" as const,
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        try {
            await newOrder.save();
        } catch (saveError) {
            await rollbackStock(priced);
            throw saveError;
        }

        if (coupon) await couponModel.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed Successfully!" })
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing Orders on Stripe — stock is NOT decremented here, only checked;
// the real decrement happens in verifyStripe on confirmed payment.
const placeOrderStripe: RequestHandler = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;
        const { origin } = req.headers;

        const { itemsAmount, priced } = await priceCartServerSide(items);
        await preflightStockCheck(priced);
        const { discount, coupon } = await applyCoupon(couponCode, userId, itemsAmount);
        const amount = itemsAmount - discount + delivery_charges;

        const orderData = {
            userId,
            items: priced,
            itemsAmount,
            discount,
            couponCode: coupon ? coupon.code : undefined,
            deliveryFee: delivery_charges,
            amount,
            address,
            paymentMethod: "Stripe" as const,
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = priced.map((item) => (
            {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
            }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges',
                },
                unit_amount: delivery_charges * 100
            },
            quantity: 1
        })

        let discounts;
        if (discount > 0) {
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(discount * 100),
                currency,
                duration: 'once'
            });
            discounts = [{ coupon: stripeCoupon.id }];
        }

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            discounts,
            mode: 'payment',
        });

        newOrder.paymentRef.gatewaySessionId = session.id;
        await newOrder.save();

        res.json({ success: true, url: session.url });

    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}

// Verify Stripe — stock decrements HERE, on verified success only.
const verifyStripe: RequestHandler = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found." });
        }
        if (order.payment) {
            // Already processed — protects against double-verify (back button, retry).
            return res.json({ success: true, message: "Order Placed" });
        }
        if (success !== "true") {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment Failed! Try again!" });
        }

        try {
            await decrementStock(order.items);
        } catch (stockError) {
            // Rare race: stock ran out between initiation and verification.
            order.status = "Stock Issue - Under Review";
            order.payment = true;
            await order.save();
            try {
                if (order.paymentRef.gatewaySessionId) {
                    const session = await stripe.checkout.sessions.retrieve(order.paymentRef.gatewaySessionId);
                    if (session.payment_intent) {
                        await stripe.refunds.create({ payment_intent: session.payment_intent as string });
                        order.status = "Refunded";
                        await order.save();
                    }
                }
            } catch (refundError: any) {
                console.log(`Auto-refund failed for order ${orderId}: ` + refundError.message);
            }
            return res.json({
                success: false,
                message: order.status === "Refunded"
                    ? "An item in your order sold out while payment was processing. You have been refunded."
                    : "An item in your order sold out while payment was processing. Our team will follow up shortly."
            });
        }

        if (order.couponCode) {
            await couponModel.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        }
        order.payment = true;
        order.status = "Order Placed";
        await order.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} })
        res.json({ success: true, message: "Order Placed" });
    }
    catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing Orders on Razorpay — stock is NOT decremented here, only checked;
// the real decrement happens in verifyRazorPayment on confirmed payment.
const placeOrderRazorPay: RequestHandler = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;

        const { itemsAmount, priced } = await priceCartServerSide(items);
        await preflightStockCheck(priced);
        const { discount, coupon } = await applyCoupon(couponCode, userId, itemsAmount);
        const amount = itemsAmount - discount + delivery_charges;

        const orderData = {
            userId,
            items: priced,
            itemsAmount,
            discount,
            couponCode: coupon ? coupon.code : undefined,
            deliveryFee: delivery_charges,
            amount,
            address,
            paymentMethod: "RazorPay" as const,
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);

        const options = {
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }
        razorpayInstance.orders.create(options, async (error: any, order: any) => {
            if (error) {
                console.log(error)
                return res.json({ success: false, message: error.message || "Error creating Razorpay order." })
            }
            newOrder.paymentRef.gatewayOrderId = order.id;
            await newOrder.save();
            res.json({ success: true, order })
        })

    } catch (error: any) {

        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorPayment: RequestHandler = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await orderModel.findOne({ "paymentRef.gatewayOrderId": razorpay_order_id });
        if (!order) {
            return res.json({ success: false, message: "Order not found." });
        }
        if (order.payment) {
            return res.json({ success: true, message: "Order Placed!" });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY as string)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed." });
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status !== "paid") {
            await orderModel.findByIdAndDelete(order._id)
            return res.json({ success: false, message: "Payment Failed! Try Again!" });
        }

        try {
            await decrementStock(order.items);
        } catch (stockError) {
            order.status = "Stock Issue - Under Review";
            order.payment = true;
            order.paymentRef.gatewayPaymentId = razorpay_payment_id;
            await order.save();
            try {
                await razorpayInstance.payments.refund(razorpay_payment_id, {});
                order.status = "Refunded";
                await order.save();
            } catch (refundError: any) {
                console.log(`Auto-refund failed for order ${order._id}: ` + refundError.message);
            }
            return res.json({
                success: false,
                message: order.status === "Refunded"
                    ? "An item in your order sold out while payment was processing. You have been refunded."
                    : "An item in your order sold out while payment was processing. Our team will follow up shortly."
            });
        }

        if (order.couponCode) {
            await couponModel.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        }
        order.payment = true;
        order.status = "Order Placed";
        order.paymentRef.gatewayPaymentId = razorpay_payment_id;
        await order.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} })
        res.json({ success: true, message: "Order Placed!" });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// All orders Admin Pannel — paginated, filterable, searchable.
// No params ⇒ page 1 / limit 20, so existing callers keep working.
const allOrders: RequestHandler = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, paymentMethod, search, dateFrom, dateTo } = req.body;

        const filter: Record<string, any> = {};
        if (status) filter.status = status;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) filter.date.$gte = new Date(dateFrom).getTime();
            if (dateTo) filter.date.$lte = new Date(dateTo).getTime();
        }
        if (search) {
            const re = new RegExp(search.trim(), 'i');
            const orConditions: Record<string, any>[] = [
                { 'address.firstName': re },
                { 'address.lastName': re },
                { 'address.email': re },
                { 'address.phone': re },
            ];
            if (mongoose.Types.ObjectId.isValid(search.trim())) {
                orConditions.push({ _id: search.trim() });
            }
            filter.$or = orConditions;
        }

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));

        const [orders, total] = await Promise.all([
            orderModel.find(filter).sort({ date: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            orderModel.countDocuments(filter),
        ]);

        res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 })
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Bulk status update (admin) — applies one status to many orders at once.
const bulkUpdateStatus: RequestHandler = async (req, res) => {
    try {
        const { orderIds, status } = req.body;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.json({ success: false, message: "No orders selected." });
        }
        if (!ORDER_STATUSES.includes(status)) {
            return res.json({ success: false, message: "Invalid status." });
        }
        const result = await orderModel.updateMany({ _id: { $in: orderIds } }, { status });
        res.json({ success: true, message: `Updated ${result.modifiedCount} order(s).` });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Refund an order (admin) — only paid, non-COD orders not already refunded.
// Restocks the items only if the order hadn't yet reached "Delivered".
const refundOrder: RequestHandler = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found." });
        if (!order.payment) return res.json({ success: false, message: "This order was never paid." });
        if (order.paymentMethod === "COD") return res.json({ success: false, message: "COD orders can't be refunded through a payment gateway." });
        if (order.status === "Refunded") return res.json({ success: false, message: "This order was already refunded." });

        if (order.paymentMethod === "Stripe") {
            if (!order.paymentRef.gatewaySessionId) return res.json({ success: false, message: "No Stripe session on file for this order." });
            const session = await stripe.checkout.sessions.retrieve(order.paymentRef.gatewaySessionId);
            if (!session.payment_intent) return res.json({ success: false, message: "No payment intent found for this order." });
            await stripe.refunds.create({ payment_intent: session.payment_intent as string });
        } else if (order.paymentMethod === "RazorPay") {
            if (!order.paymentRef.gatewayPaymentId) return res.json({ success: false, message: "No Razorpay payment on file for this order." });
            await razorpayInstance.payments.refund(order.paymentRef.gatewayPaymentId, {});
        }

        if (order.status !== "Delivered") {
            await rollbackStock(order.items);
        }

        order.status = "Refunded";
        await order.save();
        res.json({ success: true, message: "Order refunded." });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: "Refund failed: " + error.message });
    }
}

// Get User Order Data
const userOrders: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Update Order Status only from Admin Pannel
const updateOrderStatus: RequestHandler = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status }, { runValidators: true });
        res.json({ success: true, message: "Order Status Updated!" })

    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

export { placeOrder, placeOrderStripe, placeOrderRazorPay, userOrders, allOrders, updateOrderStatus, verifyStripe, verifyRazorPayment, bulkUpdateStatus, refundOrder }
