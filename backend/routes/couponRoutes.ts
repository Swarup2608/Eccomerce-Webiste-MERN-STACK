import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import { createCoupon, listCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';

const couponRouter = express.Router();

// Admin
couponRouter.post("/add", adminAuth, createCoupon);
couponRouter.post("/list", adminAuth, listCoupons);
couponRouter.post("/update", adminAuth, updateCoupon);
couponRouter.post("/remove", adminAuth, deleteCoupon);

// Customer
couponRouter.post("/validate", authUser, validateCoupon);

export default couponRouter;
