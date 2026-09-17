import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    type: "percent" | "fixed";
    value: number;
    minOrderAmount: number;
    maxUses: number | null;
    usedCount: number;
    perUserLimit: number;
    expiresAt: Date | null;
    active: boolean;
    createdAt: Date;
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const couponModel: Model<ICoupon> = mongoose.models.coupon || mongoose.model<ICoupon>("coupon", couponSchema);

export default couponModel;
