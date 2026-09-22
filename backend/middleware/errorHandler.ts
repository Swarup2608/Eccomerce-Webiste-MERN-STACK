import Stripe from 'stripe';
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError.js';

interface MongooseCastError extends Error {
    name: 'CastError';
    path: string;
    value: unknown;
}

interface MongooseValidationError extends Error {
    name: 'ValidationError';
    errors: Record<string, { message: string }>;
}

interface MongoDuplicateKeyError extends Error {
    code: 11000;
    keyValue: Record<string, unknown>;
}

interface RazorpayError {
    statusCode: number;
    error: { description: string;[key: string]: unknown };
}

const isCastError = (err: unknown): err is MongooseCastError =>
    err instanceof Error && err.name === 'CastError';

const isValidationError = (err: unknown): err is MongooseValidationError =>
    err instanceof Error && err.name === 'ValidationError';

const isDuplicateKeyError = (err: unknown): err is MongoDuplicateKeyError =>
    typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;

const isJwtError = (err: unknown): err is Error =>
    err instanceof Error && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError');

const isRazorpayError = (err: unknown): err is RazorpayError =>
    typeof err === 'object' &&
    err !== null &&
    typeof (err as RazorpayError).statusCode === 'number' &&
    typeof (err as RazorpayError).error?.description === 'string';

// Stripe error types that are the caller's fault (bad input, bad card, bad
// idempotency key) map to 400; everything else (Stripe's own API/connection/
// auth trouble) is not something the client can fix, so it maps to 502.
const STRIPE_CLIENT_FAULT_TYPES = new Set([
    'StripeCardError',
    'StripeInvalidRequestError',
    'StripeIdempotencyError',
    'StripeSignatureVerificationError',
    'StripeRateLimitError',
]);

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }

    if (isCastError(err)) {
        res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
        return;
    }

    if (isValidationError(err)) {
        const message = Object.values(err.errors).map((e) => e.message).join(', ');
        res.status(400).json({ success: false, message });
        return;
    }

    if (isDuplicateKeyError(err)) {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({ success: false, message: `${field} already exists.` });
        return;
    }

    if (isJwtError(err)) {
        res.status(401).json({ success: false, message: "Not Authorized Login Again!" });
        return;
    }

    if (err instanceof Stripe.errors.StripeError) {
        const statusCode = STRIPE_CLIENT_FAULT_TYPES.has(err.type) ? 400 : 502;
        res.status(statusCode).json({ success: false, message: err.message });
        return;
    }

    if (isRazorpayError(err)) {
        const statusCode = err.statusCode >= 400 && err.statusCode < 500 ? 400 : 502;
        res.status(statusCode).json({ success: false, message: err.error.description });
        return;
    }

    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
};
