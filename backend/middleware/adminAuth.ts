import JWT from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

const adminAuth: RequestHandler = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token || Array.isArray(token)) {
            return res.json({ success: false, message: "Not Authorized Login Again!" });
        }
        const token_decode = JWT.verify(token, env.JWT_SECRET_KEY);
        if (!token_decode || typeof token_decode === 'string' || token_decode.role !== "admin") {
            return res.json({ success: false, message: "Not Authorized Login Again!" });
        }
        req.admin = token_decode as any;
        next();
    } catch (error: any) {
        console.log("Error checking Admin Authentcation : " + error);
        res.json({ success: false, message: error.message });
    }
}

export default adminAuth;
