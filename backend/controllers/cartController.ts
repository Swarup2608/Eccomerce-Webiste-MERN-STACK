import type { RequestHandler } from "express";
import userModel from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add products to User Cart
const addToCart: RequestHandler = asyncHandler(async (req, res) => {
    const { userId, itemId, variant } = req.body;
    const userData = await userModel.findById(userId);
    if (!userData) {
        throw new AppError(404, "User not found.");
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
});

// Update User Cart
const updateUserCart: RequestHandler = asyncHandler(async (req, res) => {
    const { userId, itemId, variant, quantity } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
        throw new AppError(404, "User not found.");
    }
    let cartData = userData.cartData;

    cartData[itemId][variant] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart Updated!" });
});

// Get User Cart
const getUserCart: RequestHandler = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const userData = await userModel.findById(userId);

    res.json({ success: true, cartData: userData?.cartData });
});

export { addToCart, updateUserCart, getUserCart }
