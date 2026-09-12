import couponModel from "../models/couponModel.js";
import { applyCoupon } from "../utils/pricing.js";

// Add Coupon (admin)
const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrderAmount, maxUses, perUserLimit, expiresAt } = req.body;
        if (!code || !type || value === undefined) {
            return res.json({ success: false, message: "Code, type and value are required." });
        }
        const exists = await couponModel.findOne({ code: String(code).toUpperCase() });
        if (exists) {
            return res.json({ success: false, message: "A coupon with that code already exists." });
        }
        const coupon = new couponModel({
            code: String(code).toUpperCase(),
            type,
            value: Number(value),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxUses: maxUses === '' || maxUses === undefined || maxUses === null ? null : Number(maxUses),
            perUserLimit: Number(perUserLimit) || 1,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });
        await coupon.save();
        res.json({ success: true, message: "Coupon created.", coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating coupon: " + error.message });
    }
};

// List Coupons (admin)
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: "Error listing coupons: " + error.message });
    }
};

// Update Coupon (admin)
const updateCoupon = async (req, res) => {
    try {
        const { id, type, value, minOrderAmount, maxUses, perUserLimit, expiresAt, active } = req.body;
        const coupon = await couponModel.findById(id);
        if (!coupon) return res.json({ success: false, message: "Coupon not found." });

        if (type !== undefined) coupon.type = type;
        if (value !== undefined) coupon.value = Number(value);
        if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
        if (maxUses !== undefined) coupon.maxUses = maxUses === '' || maxUses === null ? null : Number(maxUses);
        if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit) || 1;
        if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (active !== undefined) coupon.active = !!active;

        await coupon.save();
        res.json({ success: true, message: "Coupon updated.", coupon });
    } catch (error) {
        res.json({ success: false, message: "Error updating coupon: " + error.message });
    }
};

// Delete Coupon (admin)
const deleteCoupon = async (req, res) => {
    try {
        await couponModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Coupon deleted." });
    } catch (error) {
        res.json({ success: false, message: "Error deleting coupon: " + error.message });
    }
};

// Validate Coupon (customer, at checkout) — preview only, never increments usedCount
const validateCoupon = async (req, res) => {
    try {
        const { code, itemsAmount, userId } = req.body;
        const { discount, coupon } = await applyCoupon(code, userId, Number(itemsAmount));
        res.json({ success: true, discount, code: coupon?.code });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { createCoupon, listCoupons, updateCoupon, deleteCoupon, validateCoupon };
