import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import couponModel from "../models/couponModel.js";
import orderModel from "../models/orderModel.js";

// Re-derives price/name/availability for every cart line from the
// authoritative product record — never trusts client-sent price or name.
// `items` is [{productId, variant, quantity}].
const priceCartServerSide = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Cart is empty.");
    }
    let itemsAmount = 0;
    const priced = [];
    for (const it of items) {
        const quantity = Number(it.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Invalid quantity in cart.");
        }
        const product = await productModel.findById(it.productId);
        if (!product) throw new Error(`Product not found: ${it.productId}`);
        const variantEntry = product.variants.find((v) => v.value === it.variant);
        if (!variantEntry) throw new Error(`${it.variant} is not available for ${product.name}.`);

        itemsAmount += product.price * quantity;
        priced.push({
            productId: product._id,
            name: product.name,
            variant: it.variant,
            variantLabel: product.filterLabel,
            quantity,
            price: product.price
        });
    }
    return { itemsAmount, priced };
};

// Validates a coupon code against the requesting user and cart subtotal.
// Never increments usedCount here — only actual order placement does, so an
// abandoned checkout doesn't burn a use.
const applyCoupon = async (code, userId, itemsAmount) => {
    if (!code) return { discount: 0, coupon: null };

    const coupon = await couponModel.findOne({ code: String(code).toUpperCase(), active: true });
    if (!coupon) throw new Error("Invalid coupon.");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("This coupon has expired.");
    if (itemsAmount < coupon.minOrderAmount) throw new Error(`This coupon needs a minimum order of ${coupon.minOrderAmount}.`);
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) throw new Error("This coupon has reached its usage limit.");

    const priorUses = await orderModel.countDocuments({
        userId,
        couponCode: coupon.code,
        status: { $ne: "Cancelled" }
    });
    if (priorUses >= coupon.perUserLimit) throw new Error("You have already used this coupon.");

    const discount = coupon.type === "percent"
        ? Math.round(itemsAmount * coupon.value / 100)
        : Math.min(coupon.value, itemsAmount);

    return { discount, coupon };
};

// Atomically decrements stock for every line item of one order, guarded by
// a $gte check so concurrent buyers can never oversell. Wrapped in a
// multi-document transaction (requires a replica set — MongoDB Atlas
// supports this) so a multi-item order either fully decrements or fully
// rolls back.
const decrementStock = async (items) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            for (const it of items) {
                const updated = await productModel.findOneAndUpdate(
                    { _id: it.productId, variants: { $elemMatch: { value: it.variant, stock: { $gte: it.quantity } } } },
                    { $inc: { "variants.$[elem].stock": -it.quantity } },
                    { arrayFilters: [{ "elem.value": it.variant }], new: true, session }
                );
                if (!updated) {
                    throw new Error(`Insufficient stock for ${it.variant}.`);
                }
            }
        });
    } finally {
        await session.endSession();
    }
};

// Restores stock for every line item — used when a paid order can't be
// fulfilled (stock ran out between initiation and verification) or on
// refund of a pre-delivery order.
const rollbackStock = async (items) => {
    for (const it of items) {
        await productModel.updateOne(
            { _id: it.productId },
            { $inc: { "variants.$[elem].stock": it.quantity } },
            { arrayFilters: [{ "elem.value": it.variant }] }
        );
    }
};

export { priceCartServerSide, applyCoupon, decrementStock, rollbackStock };
