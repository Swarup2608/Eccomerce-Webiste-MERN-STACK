import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
    PORT: z.coerce.number().nonnegative().default(5000),

    CLIENT_URL: z.string().url().default("http://localhost:3000"),
    ADMIN_URL: z.string().url().default("http://localhost:3001"),

    NODE_ENV: z.string().default("development"),

    CLOUDINARY_NAME: z.string().default(""),
    CLOUDINARY_API_KEY: z.string().default(""),
    CLOUDINARY_SECRET_KEY: z.string().default(""),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
    RAZORPAY_SECRET_KEY: z.string().min(1, "RAZORPAY_SECRET_KEY is required"),

    JWT_SECRET_KEY: z.string().min(1, "JWT_SECRET_KEY is required"),
});

export const env = envSchema.parse(process.env);
