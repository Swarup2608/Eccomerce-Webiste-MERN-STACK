import mongoose from "mongoose";
import type { RequestHandler } from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Orders that represent real committed revenue — excludes cancelled/refunded/
// failed/under-review, and excludes unpaid online orders still awaiting payment.
const REVENUE_MATCH = {
    status: { $nin: ["Cancelled", "Refunded", "Payment Failed", "Stock Issue - Under Review"] },
    $or: [{ payment: true }, { paymentMethod: "COD" }],
};

const daysAgo = (days: number): number => Date.now() - Number(days) * 24 * 60 * 60 * 1000;

// Summary cards: revenue, order count, AOV, new customers — all for the period.
const summary: RequestHandler = async (req, res) => {
    try {
        const days = Number(req.query.days) || 30;
        const since = daysAgo(days);

        const [agg] = await orderModel.aggregate([
            { $match: { ...REVENUE_MATCH, date: { $gte: since } } },
            { $group: { _id: null, revenue: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
        ]);

        const revenue = agg?.revenue || 0;
        const orderCount = agg?.orderCount || 0;
        const aov = orderCount > 0 ? Math.round((revenue / orderCount) * 100) / 100 : 0;

        const sinceObjectId = mongoose.Types.ObjectId.createFromTime(Math.floor(since / 1000));
        const newCustomers = await userModel.countDocuments({ _id: { $gte: sinceObjectId } });

        res.json({ success: true, revenue, orderCount, aov, newCustomers, days });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Daily revenue + order count for the period, for the chart.
const revenueOverTime: RequestHandler = async (req, res) => {
    try {
        const days = Number(req.query.days) || 30;
        const since = daysAgo(days);

        const rows = await orderModel.aggregate([
            { $match: { ...REVENUE_MATCH, date: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
                    revenue: { $sum: "$amount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, series: rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })) });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Count of orders per status (all statuses, unfiltered by revenue eligibility).
const ordersByStatus: RequestHandler = async (req, res) => {
    try {
        const rows = await orderModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, breakdown: rows.map((r) => ({ status: r._id, count: r.count })) });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Best-selling products by quantity, within the period.
const topProducts: RequestHandler = async (req, res) => {
    try {
        const days = Number(req.query.days) || 30;
        const limit = Math.min(20, Number(req.query.limit) || 5);
        const since = daysAgo(days);

        const rows = await orderModel.aggregate([
            { $match: { ...REVENUE_MATCH, date: { $gte: since } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: { productId: "$items.productId", name: "$items.name" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                },
            },
            { $sort: { quantity: -1 } },
            { $limit: limit },
        ]);

        res.json({
            success: true,
            products: rows.map((r) => ({ productId: r._id.productId, name: r._id.name, quantity: r.quantity, revenue: r.revenue })),
        });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { summary, revenueOverTime, ordersByStatus, topProducts };
