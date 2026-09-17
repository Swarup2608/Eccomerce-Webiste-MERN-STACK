import type { RequestHandler } from "express";
import userModel from "../models/userModel.js";

// Add products to User Cart
const addToCart: RequestHandler = async (req, res) => {
    try {
        const { userId, itemId, variant } = req.body;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found." });
        }
        let cartData = userData.cartData;
        if (cartData[itemId]) {
            if (cartData[itemId][variant]) {
                cartData[itemId][variant] += 1
            }
            else {
                cartData[itemId][variant] = 1
            }
        }
        else {
            cartData[itemId] = {}
            cartData[itemId][variant] = 1
        }
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Added to Cart!" });
    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// Update User Cart
const updateUserCart: RequestHandler = async (req, res) => {
    try {
        const { userId, itemId, variant, quantity } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found." });
        }
        let cartData = userData.cartData;

        cartData[itemId][variant] = quantity;

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Cart Updated!" });

    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}
// Get User Cart
const getUserCart: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);

        res.json({ success: true, cartData: userData?.cartData });

    } catch (error: any) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateUserCart, getUserCart }
