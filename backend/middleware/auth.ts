import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authUser: RequestHandler = asyncHandler(async (req, res, next) => {
    const { token } = req.headers;
    if (!token || Array.isArray(token)) {
        throw new AppError(401, "Not Authorized Login Again!");
    }
    const token_decode = jwt.verify(token, env.JWT_SECRET_KEY);
    req.body.userId = typeof token_decode === 'string' ? token_decode : token_decode.id;
    next();
});

export default authUser;
