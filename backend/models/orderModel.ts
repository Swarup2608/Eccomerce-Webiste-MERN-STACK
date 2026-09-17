import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    variant: string;
    // Snapshot of the product's filter label at order time (e.g. "Size",
    // "Material") so order history reads correctly even if the product's
    // category filter definition changes later.
    variantLabel: string;
    quantity: number;
    price: number; // server-side snapshot at order time, never client-trusted
}

export interface IPaymentRef {
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    gatewaySessionId?: string;
}

export const ORDER_STATUSES = [
    "Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered",
    "Cancelled", "Refunded", "Payment Failed", "Stock Issue - Under Review"
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    itemsAmount: number;
    discount: number;
    couponCode?: string;
    deliveryFee: number;
    amount: number; // itemsAmount - discount + deliveryFee, server-computed
    address: Record<string, any>;
    status: OrderStatus;
    paymentMethod: "COD" | "Stripe" | "RazorPay";
    payment: boolean;
    paymentRef: IPaymentRef;
    date: number;
}

const orderItemSchema = new Schema<IOrderItem>({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    name: { type: String, required: true },
    variant: { type: String, required: true },
    variantLabel: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
}, { _id: false });

const paymentRefSchema = new Schema<IPaymentRef>({
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySessionId: String
}, { _id: false });

const orderSchema = new Schema<IOrder>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: { type: [orderItemSchema], required: true },
    itemsAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryFee: { type: Number, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, enum: ORDER_STATUSES, default: "Order Placed" },
    paymentMethod: { type: String, required: true, enum: ["COD", "Stripe", "RazorPay"] },
    payment: { type: Boolean, required: true, default: false },
    paymentRef: { type: paymentRefSchema, default: () => ({}) },
    date: { type: Number, required: true }
}, { minimize: false });

const orderModel: Model<IOrder> = mongoose.models.order || mongoose.model<IOrder>("order", orderSchema);

export default orderModel;
