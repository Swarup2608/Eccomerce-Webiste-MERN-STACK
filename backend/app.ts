import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import couponRouter from './routes/couponRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';

const app = express();
const port = env.PORT;

const allowedOrigins = [
    env.CLIENT_URL,
    env.ADMIN_URL,
].filter(Boolean);

//Middle ware
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // (e.g. server-to-server, Postman, curl)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },

        credentials: true,

        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'token',
        ],

        maxAge: 86400,

        optionsSuccessStatus: 204,
    })
);

app.get('/api/health',(req,res)=>{
    res.status(200).json({
        "message": "API is healthy",
        "checks" :{
            "Database": "Connected",
            "Cloudinary": "Connected"
        },
        "Server": "Running",
        "Environment": env.NODE_ENV || "development",
        "Port": port,
        "Client URL": env.CLIENT_URL || "Not set",
        "Admin URL": env.ADMIN_URL || "Not set",
    })
})

// API end Points
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/category', categoryRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/', (req, res) => {
    res.send("API WORKING");
})

export default app;
