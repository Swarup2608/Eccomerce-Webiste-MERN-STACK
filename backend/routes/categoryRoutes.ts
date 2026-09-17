import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { addCategory, updateCategory, removeCategory, listCategories, adminListCategories } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get("/list", listCategories);
categoryRouter.post("/admin-list", adminAuth, adminListCategories);
categoryRouter.post("/add", adminAuth, addCategory);
categoryRouter.post("/update", adminAuth, updateCategory);
categoryRouter.post("/remove", adminAuth, removeCategory);

export default categoryRouter;
