import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // server-side snapshot at order time, never client-trusted
}, { _id: false });

const paymentRefSchema = new mongoose.Schema({
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySessionId: String
}, { _id: false });

const ORDER_STATUSES = [
    "Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered",
    "Cancelled", "Refunded", "Payment Failed", "Stock Issue - Under Review"
];

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: { type: [orderItemSchema], required: true },
    itemsAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryFee: { type: Number, required: true },
    amount: { type: Number, required: true }, // itemsAmount - discount + deliveryFee, server-computed
    address: { type: Object, required: true },
    status: { type: String, required: true, enum: ORDER_STATUSES, default: "Order Placed" },
    paymentMethod: { type: String, required: true, enum: ["COD", "Stripe", "RazorPay"] },
    payment: { type: Boolean, required: true, default: false },
    paymentRef: { type: paymentRefSchema, default: () => ({}) },
    date: { type: Number, required: true }
},{minimize:false});

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);

export default orderModel;
export { ORDER_STATUSES };
