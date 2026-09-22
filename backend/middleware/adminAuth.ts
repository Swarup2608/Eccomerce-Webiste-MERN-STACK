import JWT from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const adminAuth: RequestHandler = asyncHandler(async (req, res, next) => {
    const { token } = req.headers;
    if (!token || Array.isArray(token)) {
        throw new AppError(401, "Not Authorized Login Again!");
    }
    const token_decode = JWT.verify(token, env.JWT_SECRET_KEY);
    if (!token_decode || typeof token_decode === 'string' || token_decode.role !== "admin") {
        throw new AppError(401, "Not Authorized Login Again!");
    }
    req.admin = token_decode as any;
    next();
});

export default adminAuth;
