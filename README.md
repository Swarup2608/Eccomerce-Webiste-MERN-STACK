# E-commerce Website (MERN Stack)

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js. The project is split into three independent apps: a customer-facing storefront, an admin dashboard for managing products and orders, and a REST API backend that powers both.

## Features

**Storefront (frontend)**
- Browse products by category and sub-category, with search and filtering
- Product detail pages with size selection and related products
- Shopping cart with add/update quantity and running totals
- User registration and login (JWT-based authentication)
- Checkout flow with Cash on Delivery, Stripe, and Razorpay payment options
- Order history and order status tracking

**Admin dashboard (admin)**
- Secure admin login, separate from customer accounts
- Add new products with up to four images (uploaded to Cloudinary)
- View and remove existing products
- View all customer orders and update order/delivery status

**Backend (API)**
- RESTful API built with Express 5 and MongoDB (Mongoose)
- JWT authentication middleware for users and admins
- Image uploads handled with Multer + Cloudinary
- Payment integrations with Stripe and Razorpay
- Order, product, cart, and user management endpoints

## Tech Stack

- **Frontend & Admin:** React 19, Vite, React Router, Tailwind CSS, Axios, React Toastify
- **Backend:** Node.js, Express 5, MongoDB with Mongoose
- **Auth:** JSON Web Tokens (JWT), bcrypt for password hashing
- **File storage:** Cloudinary (via Multer)
- **Payments:** Stripe, Razorpay
- **Deployment:** Configured for Vercel (each of the three apps has its own `vercel.json`)

## Project Structure

```
.
├── backend/            # Express REST API
│   ├── config/         # MongoDB and Cloudinary connection setup
│   ├── controllers/    # Route handlers (cart, order, product, user)
│   ├── middleware/     # Auth (user/admin) and file upload middleware
│   ├── models/         # Mongoose schemas (order, product, user)
│   ├── routes/         # API route definitions
│   └── server.js       # App entry point
├── frontend/            # Customer-facing storefront (React + Vite)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/      # Global shop/cart state (ShopContext)
│       └── pages/         # Route-level pages (Home, Cart, Product, etc.)
└── admin/               # Admin dashboard (React + Vite)
    └── src/
        ├── components/  # Navbar, Sidebar, Login
        └── pages/        # Add, List, Orders
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [MongoDB](https://www.mongodb.com/) database (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account (for product image uploads)
- A [Stripe](https://stripe.com/) account (for Stripe payments)
- A [Razorpay](https://razorpay.com/) account (for Razorpay payments)

## Getting Started

Clone the repository and install dependencies for each app:

```bash
git clone https://github.com/Swarup2608/Eccomerce-Webiste-MERN-STACK.git
cd Eccomerce-Webiste-MERN-STACK

cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### Environment Variables

**`backend/.env`**

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret
JWT_SECRET_KEY=your_jwt_secret
ADMIN_EMAIL=your_admin_login_email
ADMIN_PASSWORD=your_admin_login_password
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_key_secret
PORT=4000
```

**`frontend/.env`**

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**`admin/.env`**

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Running Locally

Start each app in its own terminal:

```bash
# Backend API (http://localhost:4000)
cd backend
npm run server

# Storefront (http://localhost:5173)
cd frontend
npm run dev

# Admin dashboard (http://localhost:5174 or next available port)
cd admin
npm run dev
```

## API Overview

All endpoints are prefixed with `/api`.

| Resource | Base route | Notes |
|---|---|---|
| Users | `/api/user` | Register, login, admin login |
| Products | `/api/product` | List, add, remove, get single product (add/remove require admin auth) |
| Cart | `/api/cart` | Get, add, update cart items (requires user auth) |
| Orders | `/api/order` | Place orders (COD/Stripe/Razorpay), list orders, update status, verify payments |

## Deployment

Each of the three apps (`backend`, `frontend`, `admin`) includes its own `vercel.json` and can be deployed independently as separate Vercel projects. Set the corresponding environment variables above in each Vercel project's settings.

## License

ISC
