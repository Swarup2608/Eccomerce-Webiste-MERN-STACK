import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { summary, revenueOverTime, ordersByStatus, topProducts } from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

analyticsRouter.get("/summary", adminAuth, summary);
analyticsRouter.get("/revenue", adminAuth, revenueOverTime);
analyticsRouter.get("/orders-by-status", adminAuth, ordersByStatus);
analyticsRouter.get("/top-products", adminAuth, topProducts);

export default analyticsRouter;
