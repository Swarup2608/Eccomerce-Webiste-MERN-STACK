<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1e293b,100:0f172a&height=180&section=header&text=EcoCart&fontSize=56&fontColor=ffffff&fontAlignY=42&desc=Full-Stack%20E-Commerce%20Platform%20%E2%80%94%20MERN&descAlignY=68&descSize=16&descColor=94a3b8" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&size=16&duration=3200&pause=1200&color=64748B&center=true&vCenter=true&width=620&lines=Storefront+%C2%B7+Admin+Dashboard+%C2%B7+REST+API;MongoDB+%C2%B7+Express+%C2%B7+React+%C2%B7+Node.js;Stripe+and+Razorpay+payments%2C+Cloudinary+media" alt="tagline" />

<br/><br/>

<img src="https://img.shields.io/badge/status-active-2563eb?style=flat-square" />
<img src="https://img.shields.io/badge/license-ISC-64748b?style=flat-square" />
<img src="https://img.shields.io/badge/node-%3E%3D18.x-334155?style=flat-square" />
<img src="https://img.shields.io/badge/PRs-welcome-334155?style=flat-square" />

</div>

<p align="center">A production-ready, three-application MERN platform — customer storefront, admin dashboard, and REST API — with Stripe and Razorpay payment integrations and Cloudinary-backed image hosting.</p>

<p align="center">
<a href="#quick-start">Quick Start</a> ·
<a href="#features">Features</a> ·
<a href="#tech-stack">Tech Stack</a> ·
<a href="#api-documentation">API Reference</a> ·
<a href="#security-considerations">Security</a> ·
<a href="#known-issues--limitations">Known Issues</a>
</p>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Quick Start

**Prerequisites**

| Requirement        | Notes                              |
| ------------------ | ---------------------------------- |
| Node.js `v18+`     | Runtime for all three applications |
| MongoDB            | Atlas or a local instance          |
| Cloudinary account | Product image hosting              |
| Stripe account     | Card payments                      |
| Razorpay account   | India-specific payments            |

**Applications & ports**

| App             | Directory   | Port   |
| --------------- | ----------- | ------ |
| API             | `backend/`  | `4000` |
| Storefront      | `frontend/` | `3000` |
| Admin Dashboard | `admin/`    | `3001` |

### Installation

The repo is an npm workspaces monorepo — a single install at the root resolves `backend`, `frontend`, and `admin` together.

```bash
git clone https://github.com/Swarup2608/Eccomerce-Webiste-MERN-STACK.git
cd Eccomerce-Webiste-MERN-STACK

npm install
```

### Configuration

Create a `.env` file in `backend/`:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# Auth
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Running locally

Run everything at once from the root (uses `concurrently`):

```bash
npm run dev   # API + Storefront + Admin together
```

Or run each application independently:

```bash
# Terminal 1 — API
npm run dev:backend      # http://localhost:4000/api

# Terminal 2 — Storefront
npm run dev:frontend     # http://localhost:3000

# Terminal 3 — Admin Dashboard
npm run dev:admin        # http://localhost:3001
```

**Root-level scripts**

| Script          | Description                                    |
| --------------- | ----------------------------------------------- |
| `dev`           | Runs backend, frontend, and admin concurrently  |
| `dev:backend`   | Runs the API only (`backend` workspace)         |
| `dev:frontend`  | Runs the storefront only (`frontend` workspace) |
| `dev:admin`     | Runs the admin dashboard only (`admin` workspace) |
| `build`         | Builds every workspace that has a `build` script |
| `lint`          | Lints every workspace that has a `lint` script  |
| `typecheck`     | Type-checks the `backend` workspace             |

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Features

<details open>
<summary><b>Customer Storefront</b></summary>
<br/>

| Area     | Capabilities                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog  | Category and sub-category browsing, filtering and sorting, client-side search, product detail pages with size/variant selection, related products |
| Shopping | Persistent cart, real-time totals, guest checkout, wishlist-ready                                                                                 |
| Accounts | JWT registration and login, order history and tracking, profile management                                                                        |
| Checkout | Cash on Delivery, Stripe Checkout, Razorpay; multi-address ready                                                                                  |

</details>

<details>
<summary><b>Admin Dashboard</b></summary>
<br/>

| Area      | Capabilities                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Auth      | Separate admin login, JWT-protected routes, role-based access                                                         |
| Products  | Up to four images per product via Cloudinary, edit/update/delete, CSV export, category management, inventory tracking |
| Orders    | View all orders, update status (Processing → Shipped → Delivered), payment confirmation, CSV reports                  |
| Analytics | Revenue charts and trends, top products, order status breakdown, summary cards                                        |
| Coupons   | Create, edit, and delete discount codes; usage tracking                                                               |

</details>

<details>
<summary><b>Backend API</b></summary>
<br/>

| Area         | Capabilities                                                                           |
| ------------ | -------------------------------------------------------------------------------------- |
| Architecture | Controller/model/middleware/route separation, consistent error handling                |
| Auth         | JWT with bcrypt (10-round salting), user and admin middleware guards                   |
| Data         | MongoDB with Mongoose, schema validation, relational integrity                         |
| Uploads      | Multer to Cloudinary, multi-format image support                                       |
| Payments     | Stripe Checkout sessions, Razorpay orders, verification endpoints                      |
| Search       | Product search by name, category, and price; order filtering by status, user, and date |

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Tech Stack

| Layer            | Technology         | Version  | Notes                            |
| ---------------- | ------------------ | -------- | -------------------------------- |
| Frontend         | React + Vite       | 19 · 6   | Fast builds, type-safe           |
| Styling          | Tailwind CSS       | 4        | Utility-first                    |
| State            | Context API        | —        | Products, cart, auth             |
| HTTP             | Axios              | 1.10+    | Promise-based client             |
| Notifications    | React Toastify     | 11+      | Toast feedback                   |
| Backend Runtime  | Node.js            | 18+      | —                                |
| Server Framework | Express            | 5.1      | Lightweight, unopinionated       |
| Database         | MongoDB + Mongoose | 8        | Document-oriented NoSQL + ODM    |
| Auth             | JWT + bcrypt       | 9 · 6    | Token-based auth                 |
| File Storage     | Cloudinary         | 2.6+     | Cloud image CDN                  |
| Form Parsing     | Multer             | 2.0+     | Multipart form data              |
| Payments         | Stripe + Razorpay  | 18 · 2.9 | Global and India-specific        |
| Validation       | Validator.js       | 13+      | Email, URL, and input validation |
| Deployment       | Vercel             | —        | Serverless and static hosting    |

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Project Structure

```
Eccomerce-Webiste-MERN-STACK/
│
├── package.json             # npm workspaces root (backend, frontend, admin)
│
├── backend/                # Node.js + Express API
│   ├── config/             # mongodb, cloudinary, admin/category bootstrap
│   ├── controllers/        # user, product, cart, order, category, coupon, analytics
│   ├── middleware/         # auth, adminAuth, multer
│   ├── models/             # user, product, order, category, coupon, admin
│   ├── routes/             # userRoute, productRoute, cartRoute, orderRoute, ...
│   ├── scripts/            # migrateVariants, migrateSizes
│   ├── utils/pricing.js
│   └── server.js
│
├── frontend/                # React + Vite storefront
│   └── src/
│       ├── app/            # page, layout, cart, collections, product/[id],
│       │                   # login, place-order, orders, verify, about, contact
│       ├── components/     # Navbar, Footer, HeroCarousel, ProductCard, ...
│       ├── context/        # ShopContext, useShop
│       ├── hooks/          # useTilt
│       └── lib/            # types, assets
│
├── admin/                   # React + Vite admin dashboard
│   └── src/
│       ├── app/             # dashboard, add, edit/[id], list, categories,
│       │                    # coupons, orders, customers
│       ├── components/      # AdminLogin, AdminGate, Sidebar, Topbar,
│       │                    # ProductForm, analytics/*
│       ├── context/         # AdminContext, useAdmin
│       └── lib/             # types, csv
│
├── README.md
└── PROJECT_AUDIT_AND_ROADMAP.md
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## API Documentation

All authenticated endpoints require a `token` header:

```http
GET /api/user/getUserCart
token: <jwt_token>
```

<details open>
<summary><b>User</b></summary>

| Method | Endpoint                | Auth | Description          |
| ------ | ----------------------- | :--: | -------------------- |
| POST   | `/api/user/register`    |  —   | Register new user    |
| POST   | `/api/user/login`       |  —   | Login user           |
| POST   | `/api/user/logout`      |  ✓   | Logout (clear token) |
| GET    | `/api/user/getUserCart` |  ✓   | Fetch user's cart    |
| GET    | `/api/user/getOrders`   |  ✓   | Fetch user's orders  |

</details>

<details>
<summary><b>Product &amp; Cart</b></summary>

| Method | Endpoint                  | Auth  | Description               |
| ------ | ------------------------- | :---: | ------------------------- |
| GET    | `/api/product/list`       |   —   | Get all products          |
| GET    | `/api/product/search`     |   —   | Search products (`q`)     |
| POST   | `/api/product/add`        | admin | Add new product           |
| POST   | `/api/product/edit/:id`   | admin | Update product            |
| DELETE | `/api/product/delete/:id` | admin | Delete product            |
| POST   | `/api/cart/add`           |   ✓   | Add item to cart          |
| POST   | `/api/cart/update`        |   ✓   | Update cart item quantity |
| POST   | `/api/cart/remove`        |   ✓   | Remove item from cart     |

</details>

<details>
<summary><b>Orders &amp; Admin</b></summary>

| Method | Endpoint                   | Auth  | Description                    |
| ------ | -------------------------- | :---: | ------------------------------ |
| POST   | `/api/order/create`        |   ✓   | Create order (COD)             |
| POST   | `/api/order/stripe`        |   ✓   | Create Stripe Checkout session |
| POST   | `/api/order/razorpay`      |   ✓   | Create Razorpay order          |
| GET    | `/api/order/verify`        |   ✓   | Verify Stripe/Razorpay payment |
| GET    | `/api/order/list`          | admin | Get all orders                 |
| POST   | `/api/user/admin/login`    |   —   | Admin login                    |
| POST   | `/api/order/updateStatus`  | admin | Update order status            |
| GET    | `/api/analytics/dashboard` | admin | Dashboard metrics              |

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Security Considerations

**Strengths**

- Passwords hashed with bcrypt (10-round salting)
- JWT-based stateless authentication
- Images stored on Cloudinary, not in the database or on disk
- Email validation on registration
- Admin authentication separate from user accounts

**Known limitations**

- JWTs do not expire — add `expiresIn` and refresh tokens
- No role hierarchy (RBAC) for admin accounts
- No rate limiting on authentication endpoints
- Payment verification relies on client-side callbacks rather than webhooks
- Cart totals are calculated client-side
- Multer saves to disk, which fails on serverless platforms
- CORS is fully open in development

See [`PROJECT_AUDIT_AND_ROADMAP.md`](./PROJECT_AUDIT_AND_ROADMAP.md) for the full review.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Environment Variables

<details>
<summary><b>backend/.env</b></summary>

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ecocart

JWT_SECRET=your-secure-random-string-here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password_here

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public

RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://yoursite.com
PORT=4000
```

</details>

<details>
<summary><b>frontend/.env</b></summary>

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=EcoCart
```

</details>

<details>
<summary><b>admin/.env</b></summary>

```env
VITE_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=EcoCart Admin
```

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Deployment

Each application (`backend`, `frontend`, `admin`) includes its own `vercel.json` and can be deployed independently:

```bash
cd frontend && vercel deploy   # Storefront
cd admin    && vercel deploy   # Admin dashboard
cd backend  && vercel deploy   # API
```

Set every `.env` variable listed above in your hosting platform's dashboard (Vercel → Settings → Environment Variables; Heroku → Config Vars; AWS → Secrets Manager).

Docker support (`Dockerfile` and `docker-compose.yml`) is on the roadmap.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Testing & Quality

**Current state**

- Backend has a small test suite (`backend/tests/`, 18 tests via `node --test`/`tsx`) covering env validation and the health endpoint — no coverage yet for controllers, pricing, or the payment flows
- No frontend/admin unit or integration tests
- No end-to-end tests
- No backend linting (no `lint` script in `backend/package.json`). `frontend` and `admin` both lint clean via ESLint 9 flat config (`npm run lint --workspaces --if-present` from the root)

**Roadmap**

- [ ] Jest + Supertest for the backend
- [ ] Vitest + React Testing Library for the frontend
- [ ] Playwright end-to-end tests
- [ ] Pre-commit hooks (husky + lint-staged)
- [ ] CI/CD with GitHub Actions

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Known Issues & Limitations

| #   | Issue                    | Impact                                            |
| --- | ------------------------ | ------------------------------------------------- |
| 1   | Multer saves to disk     | Fails on Vercel serverless (read-only filesystem) |
| 2   | No pagination            | Large catalogs degrade performance                |
| 3   | No server-side search    | All filtering done client-side                    |
| 4   | No admin RBAC            | Single admin account only                         |
| 5   | No inventory tracking    | Overselling is structurally possible              |
| 6   | Guest cart not persisted | Cart is lost on page refresh                      |
| 7   | No transactional email   | No order-confirmation emails                      |
| 8   | No audit trail           | Admin actions are not logged                      |
| 9   | No payment webhooks      | Verification relies on client-side callbacks      |

Full write-up in [`PROJECT_AUDIT_AND_ROADMAP.md`](./PROJECT_AUDIT_AND_ROADMAP.md).

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Developer Guide

**Adding a feature**

1. **Backend** — add a controller, then a route, then a model schema if needed.
2. **Frontend** — create a component, add it to a page, and wire it into `ShopContext`.
3. **Admin** — create a page, add a sidebar link, and wire it into `AdminContext`.

**Code style** — Plain JavaScript on the backend (no TypeScript yet); TypeScript in strict mode with Tailwind CSS on the frontend and admin apps; `camelCase` for variables and functions, `PascalCase` for components and classes.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:e2e8f0,100:e2e8f0&height=2&section=header"/>

## Contributing

```bash
git checkout -b feature/your-feature
# make changes, test locally
git commit -m "Add feature: your feature"
git push origin feature/your-feature
# open a pull request
```

Please follow the existing code style, update this README when adding features, and note any breaking changes in the roadmap.

<br/>

<div align="center">

**Author:** Swarup &nbsp;·&nbsp; **License:** ISC © 2026 EcoCart

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1e293b,100:0f172a&height=60&section=footer"/>
