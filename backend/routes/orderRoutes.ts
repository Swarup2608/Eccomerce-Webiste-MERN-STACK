import express from 'express'
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { allOrders, placeOrder, placeOrderRazorPay, placeOrderStripe, updateOrderStatus, userOrders, verifyRazorPayment, verifyStripe, bulkUpdateStatus, refundOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();
// POST METHODS

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/statusupdate", adminAuth, updateOrderStatus);
orderRouter.post("/bulk-status", adminAuth, bulkUpdateStatus);
orderRouter.post("/refund", adminAuth, refundOrder);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorPay);

// User Features
orderRouter.post("/userorders", authUser, userOrders);

// Verify Payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorPay", authUser, verifyRazorPayment);


export default orderRouter;
