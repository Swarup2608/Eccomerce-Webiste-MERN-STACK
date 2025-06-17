import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// Global Variables
const currency = "inr"
const delivery_charges = 10

// GATEWAY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_SECRET_KEY
});

// Placing Orders on COD:
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed Successfully!" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing Orders on Stripe:
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        const line_items = items.map((item) => (
            {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: amount * 100
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

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true, message: "Order Placed" });
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Failed! Try again!" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing Orders on Razorpay:
const placeOrderRazorPay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "RazorPay",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount:  amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }
        await razorpayInstance.orders.create(options,(error,order)=>{
            if(error){
                console.log(error)
                return res.json({success:false,message:error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorPayment = async (req,res) => {
    try {
        const {userId,razorpay_order_id} = req.body;
        const orderInfo  = await razorpayInstance.orders.fetch(razorpay_order_id);
        if(orderInfo.status === "paid"){
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({success:true,message:"Order Placed!"});
        }
        else{
            await orderModel.findByIdAndDelete(orderInfo.receipt)
            res.json({success:false,message:"Payment Failed! Try Again!"});
        }
        console.log(orderInfo)
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
        
    }
}

// All orders Admin Pannel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Get User Order Data
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Update Order Status only from Admin Pannel
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Order Status Updated!" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

export { placeOrder, placeOrderStripe, placeOrderRazorPay, userOrders, allOrders, updateOrderStatus, verifyStripe, verifyRazorPayment }





