import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

const authUser: RequestHandler = async (req, res, next) => {

    const { token } = req.headers;
    if (!token || Array.isArray(token)) {
        return res.json({ success: false, message: "Not Authorized Login Again!" })
    }
    try {
        const token_decode = jwt.verify(token, env.JWT_SECRET_KEY);
        req.body.userId = typeof token_decode === 'string' ? token_decode : token_decode.id;
        next();
    } catch (error: any) {
        console.log(error);
        return res.json({ success: false, message: error.message })
    }
}

export default authUser;
