import validator from 'validator';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import type { RequestHandler } from "express";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// CREATE TOKEN
const createToken = (id: unknown): string => {
    return JWT.sign({ id }, env.JWT_SECRET_KEY);
}

// Route for user Login
const loginUser: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if email is valid
    if (!validator.isEmail(email)) {
        throw new AppError(400, "Enter a Valid Email!");
    }
    if (password.length < 8) {
        throw new AppError(400, "Enter a valid Password!");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new AppError(401, "User not found!");
    }
    if (user.isBlocked) {
        throw new AppError(403, "This account has been suspended. Contact support for help.");
    }
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (isMatch) {
        const token = createToken(user._id);
        return res.json({ success: true, token });
    }
    throw new AppError(401, "Invalid Credentials!");
});

// Route for user Registeration
const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
        throw new AppError(409, "User Already Exists!");
    }
    // Validating Email Format and Strong Password
    if (!validator.isEmail(email)) {
        throw new AppError(400, "Enter a Valid Email!");
    }
    if (password.length < 8) {
        throw new AppError(400, "Enter a strong Password!");
    }
    //Hashing Password
    const salt = await bcrypt.genSalt(10);
    const HashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
        "name": name,
        "email": email,
        "password": HashedPassword
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
});

// Route for Admin Login
const adminLogin: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });
    if (!admin) {
        throw new AppError(401, "Invalid Credentials!");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new AppError(401, "Invalid Credentials!");
    }
    const token = JWT.sign({ id: admin._id, role: admin.role }, env.JWT_SECRET_KEY, { expiresIn: '12h' });
    res.json({ success: true, token });
});

export { loginUser, registerUser, adminLogin };
