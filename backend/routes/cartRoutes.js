import express from 'express'
import { getUserCart, addToCart, updateUserCart } from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();
// POST METHODS
cartRouter.post("/get",authUser,getUserCart);
cartRouter.post("/add",authUser,addToCart);
cartRouter.post("/update",authUser,updateUserCart);


export default cartRouter;