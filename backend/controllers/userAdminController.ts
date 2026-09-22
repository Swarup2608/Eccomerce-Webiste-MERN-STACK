import type { RequestHandler } from "express";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// List customers (admin) — paginated + searchable, password always excluded.
const listUsers: RequestHandler = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.body;
    const filter: Record<string, any> = {};
    if (search) {
        const re = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: re }, { email: re }];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));

    const [users, total] = await Promise.all([
        userModel.find(filter, '-password -cartData').sort({ _id: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
        userModel.countDocuments(filter),
    ]);

    // ObjectIds embed a creation timestamp — no createdAt backfill needed.
    const withJoinDate = users.map((u) => ({ ...u.toObject(), joinedAt: u._id.getTimestamp() }));

    res.json({ success: true, users: withJoinDate, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

// Customer profile + order history + spend summary (admin)
const getUserDetail: RequestHandler = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const user = await userModel.findById(userId, '-password -cartData');
    if (!user) throw new AppError(404, "Customer not found.");

    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    const totalSpend = orders.filter((o) => o.payment || o.paymentMethod === 'COD').reduce((sum, o) => sum + o.amount, 0);

    res.json({
        success: true,
        user: { ...user.toObject(), joinedAt: user._id.getTimestamp() },
        orders,
        summary: { orderCount: orders.length, totalSpend },
    });
});

// Block / unblock a customer (admin)
const setUserBlocked: RequestHandler = asyncHandler(async (req, res) => {
    const { userId, isBlocked } = req.body;
    const user = await userModel.findByIdAndUpdate(userId, { isBlocked: !!isBlocked }, { new: true });
    if (!user) throw new AppError(404, "Customer not found.");
    res.json({ success: true, message: isBlocked ? "Customer blocked." : "Customer unblocked." });
});

export { listUsers, getUserDetail, setUserBlocked };
