import type { RequestHandler } from "express";
import couponModel from "../models/couponModel.js";
import { applyCoupon } from "../utils/pricing.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add Coupon (admin)
const createCoupon: RequestHandler = asyncHandler(async (req, res) => {
    const { code, type, value, minOrderAmount, maxUses, perUserLimit, expiresAt } = req.body;
    if (!code || !type || value === undefined) {
        throw new AppError(400, "Code, type and value are required.");
    }
    const exists = await couponModel.findOne({ code: String(code).toUpperCase() });
    if (exists) {
        throw new AppError(409, "A coupon with that code already exists.");
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
});

// List Coupons (admin)
const listCoupons: RequestHandler = asyncHandler(async (req, res) => {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
});

// Update Coupon (admin)
const updateCoupon: RequestHandler = asyncHandler(async (req, res) => {
    const { id, type, value, minOrderAmount, maxUses, perUserLimit, expiresAt, active } = req.body;
    const coupon = await couponModel.findById(id);
    if (!coupon) throw new AppError(404, "Coupon not found.");

    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = Number(value);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
    if (maxUses !== undefined) coupon.maxUses = maxUses === '' || maxUses === null ? null : Number(maxUses);
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit) || 1;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) coupon.active = !!active;

    await coupon.save();
    res.json({ success: true, message: "Coupon updated.", coupon });
});

// Delete Coupon (admin)
const deleteCoupon: RequestHandler = asyncHandler(async (req, res) => {
    await couponModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Coupon deleted." });
});

// Validate Coupon (customer, at checkout) — preview only, never increments usedCount
const validateCoupon: RequestHandler = asyncHandler(async (req, res) => {
    const { code, itemsAmount, userId } = req.body;
    const { discount, coupon } = await applyCoupon(code, userId, Number(itemsAmount));
    res.json({ success: true, discount, code: coupon?.code });
});

export { createCoupon, listCoupons, updateCoupon, deleteCoupon, validateCoupon };
