# MERN E‑Commerce — End‑to‑End Survey, Audit & Roadmap

> Purpose of this document: a full technical walkthrough of the codebase, every bug / loophole / weak
> spot I could find, and a prioritized backlog of upgrades spanning **full‑stack engineering** and
> **system design** — plus a set of **AI features built with web scraping + classical ML only** (no
> paid LLM tokens / no Anthropic/OpenAI API keys). The last two sections turn all of this into
> **resume‑ready bullet points and interview talking points for a 20+ LPA full‑stack role**.

---

## 1. Executive Summary

This is a 3‑app MERN monorepo:

| App | Path | Stack | Deploy |
|---|---|---|---|
| Storefront | [frontend/](frontend/) | React 19 + Vite 6, React Router 7, Tailwind 4, Axios, Context API | Vercel (static) |
| Admin dashboard | [admin/](admin/) | React 19 + Vite 6, React Router 7, Tailwind 4, Axios | Vercel (static) |
| REST API | [backend/](backend/) | Node + Express 5, Mongoose 8, JWT, bcrypt, Multer + Cloudinary, Stripe, Razorpay | Vercel (`@vercel/node`) |

**What is solid**
- Clean separation of storefront / admin / API; each independently deployable.
- Auth uses JWT + bcrypt (salted, 10 rounds); email validated with `validator`.
- Image uploads offloaded to Cloudinary; product media not stored in Mongo.
- Two real payment integrations (Stripe Checkout, Razorpay) plus COD.
- Sensible React composition (reusable `Title`, `ProductItem`, `CartTotal`, global `ShopContext`).

**What is concerning (headlines — details in §5 / §6)**
1. **Payment can be forged.** Stripe "success" is trusted from a redirect query param (`/verify?success=true`) with no webhook and no `stripe.checkout.sessions.retrieve` — any user can mark any order paid. citefile: [backend/controllers/orderController.js](backend/controllers/orderController.js)
2. **Order total is set by the browser.** `amount` is computed client‑side in [frontend/src/pages/PlaceOrder.jsx](frontend/src/pages/PlaceOrder.jsx) and stored verbatim by the API — a user can pay ₹1 for any cart.
3. **Stripe line items are mispriced.** `unit_amount: amount * 100` inside `items.map(...)` charges the *entire order total* for *every* line — massive overcharge bug.
4. **JWTs never expire** and are stored in `localStorage` (XSS‑exfiltratable). No refresh/rotation/logout invalidation.
5. **Admin auth is a shared secret.** The "token" is `sign(ADMIN_EMAIL + ADMIN_PASSWORD)`; a leaked token is valid forever, one admin only, no RBAC, no audit trail.
6. **`adminAuth` crashes in its own error path** (`err.message` where the variable is `error`) — [backend/middleware/adminAuth.js](backend/middleware/adminAuth.js).
7. **No inventory model** → overselling is structurally impossible to prevent.
8. **No pagination / server‑side search** anywhere — the storefront downloads the entire product and order collections.
9. **Multer disk storage on Vercel serverless** — writes to a read‑only FS; temp files also never deleted.
10. **Zero automated tests, no CI, no observability, no rate limiting, `cors()` fully open.**

---

## 2. Architecture Overview

```
                         ┌─────────────────────────┐
                         │  Storefront (React SPA) │  Vercel static
                         │  ShopContext (global)   │
                         └───────────┬─────────────┘
                                     │ axios, header: token
                                     ▼
┌────────────────────┐     ┌───────────────────────────────┐     ┌──────────────────┐
│ Admin (React SPA)  │────▶│  Express 5 REST API           │────▶│  MongoDB Atlas   │
│  token in LS       │     │  /api/user  /api/product      │     │  (Mongoose)      │
└────────────────────┘     │  /api/cart  /api/order        │     └──────────────────┘
                           │                               │
                           │  middleware/auth.js (user)    │────▶  Cloudinary (images)
                           │  middleware/adminAuth.js      │────▶  Stripe Checkout
                           │  middleware/multer.js (disk)  │────▶  Razorpay Orders
                           └───────────────────────────────┘
```

- **State**: storefront keeps `products`, `cartItems`, `token`, `search` in a single Context provider ([frontend/src/context/ShopContext.jsx](frontend/src/context/ShopContext.jsx)). No data‑fetching library, no cache, no persistence for guest carts.
- **Auth**: bearer‑style token passed as a **non‑standard `token` header** (not `Authorization: Bearer`). User token = `{ id }`; admin token = signed `email+password` string.
- **All API responses return HTTP 200** with `{ success: boolean }` — even errors and auth failures. No use of 4xx/5xx.

---

## 3. Tech Stack Inventory & Version Notes

| Concern | Current | Notes / risk |
|---|---|---|
| Runtime | Node (unpinned — no `engines`, no `.nvmrc`) | Repro/deploy drift |
| API framework | Express **5.1** | v5 changes: `req.body` undefined without body‑parser hit; async errors now forwarded — but code still hand‑catches everything |
| ODM | Mongoose 8 | No `timestamps`, no indexes beyond `email unique`, `date` stored as `Number` |
| Auth | jsonwebtoken 9, bcrypt 6 | No `expiresIn`, no refresh tokens |
| Uploads | multer 2 (diskStorage) + cloudinary 2 | Breaks on serverless; no size/type limits; temp files leak |
| Payments | stripe 18, razorpay 2.9 | No webhooks, no signature verification, no idempotency keys |
| Frontend | React 19, Vite 6, react‑router 7, Tailwind 4 | `react-router` **and** `react-router-dom` both installed; mixed imports from each |
| Toasts | react-toastify 11 | Frontend imports `react-toastify/ReactToastify.css` (admin uses the correct `.../dist/ReactToastify.css`) — inconsistent, likely unstyled |
| Lint | eslint 9 (frontend/admin only) | **Backend has no lint, no Prettier, no formatting config** |
| Tests | none | No Jest/Vitest/RTL/Supertest/Playwright |
| Types | none | Plain JS everywhere |
| CI/CD | none | No GitHub Actions, no pre‑commit hooks |
| Container | none | No Dockerfile / compose |
| Config | `dotenv`, no schema validation | Missing env var = silent `undefined` |

---

## 4. End‑to‑End Flow Walkthroughs

### 4.1 Registration / Login
`Login.jsx` → `POST /api/user/register|login` → `userController` validates email + `password.length >= 8`, bcrypt‑hashes, `sign({id}, SECRET)` → token to `localStorage`.
Issues: no expiry, `password` not `required` in schema, `exists` check runs **before** email validation (NoSQL‑injectable enumeration — `email: {"$ne":null}`), no rate limiting, no account lockout, no email verification, no "forgot password" (the link is a dead `<p>`), after login the server cart is **not** re‑fetched until a full page refresh (`getUserCart` only runs on mount).

### 4.2 Catalog browse / search / filter
`ShopContext` fetches **all** products once (`GET /api/product/list`). `Collection.jsx` filters and sorts **in the browser**. `SearchBar` is client‑side substring match on `name` only, no debounce, only shows on routes containing `"collection"` (route is actually `/collections` — works by substring, fragile).
Issues: no pagination, no server search, `loading` flag flips synchronously so skeleton never shows and an empty‑state flashes; sort is not re‑applied after a filter change; ratings ("122 reviews", 4 stars) are hard‑coded in [frontend/src/pages/Product.jsx](frontend/src/pages/Product.jsx).

### 4.3 Cart
`addToCart` optimistically mutates local state, then (only if `token`) calls `POST /api/cart/add`; on API failure there is **no rollback**. Guests get a toast error but the item is still added to local state, and the guest cart is **not persisted** (no `localStorage`), so it vanishes on refresh. Backend `addToCart`/`updateUserCart` read `userData.cartData`, blindly index `cartData[itemId][size]`, and never validate that `itemId` is a real product or that `quantity >= 0` — negative quantities and junk keys are accepted. `updateUserCart` throws if `cartData[itemId]` is undefined.

### 4.4 Checkout & Payment
`PlaceOrder.jsx` builds `orderItems` from a **client‑side clone of product data** and sends `amount = getCartAmount() + delivery_fee`.
- **COD**: `POST /api/order/place` — stores the client `amount` and `items` as‑is, clears cart. No stock decrement.
- **Stripe**: `POST /api/order/stripe` creates an order (`payment:false`), builds `line_items` with the **bug** `unit_amount: amount * 100` for every item, creates a Checkout Session with `success_url = {origin}/verify?success=true&orderId=...`. `verify.jsx` calls `POST /api/order/verifyStripe` which sets `payment:true` **iff `success === "true"`** — no call to Stripe to confirm the session actually paid. **Forgeable.**
- **Razorpay**: `POST /api/order/razorpay` → `razorpayInstance.orders.create`; browser opens the widget; handler posts the Razorpay response to `verifyRazorPay`, which **re‑fetches the order from Razorpay and checks `status === "paid"`** (better than Stripe here) but **never verifies `razorpay_signature`** (HMAC of `order_id|payment_id` with `key_secret`), which is the documented integrity check.
No idempotency keys, no webhooks, no reconciliation job, no saga/rollback if `save()` succeeds but cart‑clear fails.

### 4.5 Admin
Single hard‑coded admin from env. `Add.jsx` posts `multipart/form-data`; `productController.addProduct` uploads each file to Cloudinary, `JSON.parse(sizes)`, `Number(price)` (no validation — negative / NaN pass). `List.jsx` / `Orders.jsx` load entire collections; status is a free select with an empty default option that can push `status: ""`.

---

## 5. Bug & Defect Register

Severity: 🔴 Critical (security / money / data loss) · 🟠 High (broken feature / crash) · 🟡 Medium · 🔵 Low / polish

| # | Sev | Area | File | Problem | Fix direction |
|---|---|---|---|---|---|
| 1 | 🔴 | Payments | [orderController.js](backend/controllers/orderController.js) `verifyStripe` | Payment marked paid purely from `success` query param; no Stripe session retrieval / webhook | Verify via `stripe.checkout.sessions.retrieve` + `payment_status === 'paid'`; add `/webhook` with `stripe.webhooks.constructEvent` and raw‑body parser |
| 2 | 🔴 | Payments | [PlaceOrder.jsx](frontend/src/pages/PlaceOrder.jsx) → `placeOrder*` | `amount` computed in browser and trusted by API | Recompute total server‑side from DB prices + shipping; ignore client `amount` |
| 3 | 🔴 | Payments | [orderController.js](backend/controllers/orderController.js) `placeOrderStripe` | `unit_amount: amount * 100` per line → charges full order total for each item | `unit_amount: item.price * 100`, `quantity: item.quantity`; add delivery as one line |
| 4 | 🔴 | Payments | `placeOrderRazorPay` / `verifyRazorPayment` | `razorpay_signature` HMAC never validated | `crypto.createHmac('sha256', KEY_SECRET).update(order_id + '|' + payment_id)` compare |
| 5 | 🔴 | Auth | [userController.js](backend/controllers/userController.js) `createToken` | JWT has no `expiresIn`; no refresh/rotation/blacklist | Short‑lived access token (15m) + rotating refresh token in httpOnly cookie |
| 6 | 🔴 | Auth | [ShopContext.jsx](frontend/src/context/ShopContext.jsx), [admin/src/App.jsx](admin/src/App.jsx) | Token in `localStorage` → stealable via any XSS | Move to httpOnly, `Secure`, `SameSite` cookie; add CSRF token |
| 7 | 🔴 | Auth | [adminAuth.js](backend/middleware/adminAuth.js) | Admin "token" = signed `EMAIL+PASSWORD`; one admin, never expires, no RBAC/audit | Real `admin` users collection, hashed passwords, `role` claim, RBAC middleware, audit log |
| 8 | 🟠 | Crash | [adminAuth.js](backend/middleware/adminAuth.js) | `catch (error) { ... res.json({ message: err.message }) }` → `err` undefined → ReferenceError, no response | Use `error.message`; add central error handler |
| 9 | 🔴 | Infra | [config/mongodb.js](backend/config/mongodb.js) | `` `${MONGODB_URI}/e-comerce` `` breaks if the URI carries query params (`?retryWrites=...`) | Pass DB name via `mongoose.connect(uri, { dbName: 'ecommerce' })`; fix typo `e-comerce` |
| 10 | 🟠 | Uploads | [middleware/multer.js](backend/middleware/multer.js) | `diskStorage` on Vercel (read‑only FS); `file.originalname` as filename → collisions + path‑traversal; no size/mime limits; temp files never `unlink`ed | `multer.memoryStorage()` + `cloudinary.uploader.upload_stream`; `limits`, `fileFilter`; or direct‑to‑Cloudinary signed uploads |
| 11 | 🔴 | Inventory | [productModel.js](backend/models/productModel.js) | No stock field → oversell; no reservation on checkout | Add `stock`/`variants[].stock`; decrement in a transaction / reservation TTL |
| 12 | 🟠 | Data integrity | `placeOrder*` | Order `items` (name, price, image) taken from client clone | Rebuild each line from DB by `productId`; store immutable price snapshot server‑side |
| 13 | 🟠 | Consistency | `placeOrder` | `newOrder.save()` then `findByIdAndUpdate(cartData:{})` — not atomic | Mongo transaction / session, or outbox pattern |
| 14 | 🟠 | Cart | [cartController.js](backend/controllers/cartController.js) | No validation of `itemId` / `size` / `quantity`; negative qty accepted; throws on missing key | Validate against product + sizes; clamp `quantity` to `[1, stock]` |
| 15 | 🟠 | Cart UX | [ShopContext.jsx](frontend/src/context/ShopContext.jsx) | Optimistic add with no rollback; guest cart not persisted; server cart not refetched after login | Rollback on failure; persist guest cart to `localStorage`; call `getUserCart` in login handler; merge guest→user cart on login |
| 16 | 🟡 | API semantics | all controllers | Every response is HTTP 200, even auth failure / server error | Proper status codes (400/401/403/404/409/422/500) + error middleware |
| 17 | 🟡 | Security | [server.js](backend/server.js) | `app.use(cors())` allows every origin; no `helmet`; no rate limit; no `express-mongo-sanitize` | Allow‑list origins; `helmet()`; `express-rate-limit` on `/api/user/*`; sanitize inputs |
| 18 | 🟡 | Validation | [productController.js](backend/controllers/productController.js) | `Number(price)` unchecked (NaN/negative), no `ObjectId` check on `remove`/`single` | `zod`/`joi` schema; `mongoose.isValidObjectId` guard |
| 19 | 🟡 | NoSQL injection | `registerUser` / `singleProduct` | Object payloads reach `findOne`/`findById` before type checks | Validate body types first; `express-mongo-sanitize` |
| 20 | 🟠 | Frontend | [frontend/src/App.jsx](frontend/src/App.jsx) | `import 'react-toastify/ReactToastify.css'` (wrong/inconsistent path) → toasts likely unstyled | Use `react-toastify/dist/ReactToastify.css` |
| 21 | 🟠 | Frontend | [Navbar.jsx](frontend/src/components/Navbar.jsx) | Links to `/profile` but no such route → blank screen; no 404 route | Add `Profile` page + `<Route path="*">` NotFound |
| 22 | 🟡 | Frontend | [Collection.jsx](frontend/src/pages/Collection.jsx) | `loading` flips synchronously (never renders); sort lost on filter change; empty‑state flash | Derive lists with `useMemo`; combine filter+sort in one pass |
| 23 | 🟡 | Frontend | [Product.jsx](frontend/src/pages/Product.jsx) | `products.map()` used as a search loop; ratings/review counts hard‑coded | `products.find()`; real `Review` model + aggregate rating |
| 24 | 🔵 | Frontend | [Orders.jsx](frontend/src/pages/Orders.jsx) | Missing `key` on mapped row; dead `import { all } from 'axios'`; empty `catch {}` swallows errors | Add keys; remove import; surface errors |
| 25 | 🔵 | Frontend | [Cart.jsx](frontend/src/pages/Cart.jsx) | Qty `<input>` uncontrolled (`defaultValue`), no max, no stock check | Controlled input, clamp to stock |
| 26 | 🔵 | Frontend | [CartTotal.jsx](frontend/src/components/CartTotal.jsx) | String‑concatenated `.00`; breaks on decimal prices; no i18n currency | `Intl.NumberFormat` |
| 27 | 🔵 | Infra | [config/mongodb.js](backend/config/mongodb.js) | No `.catch` on `connectDB()` in `server.js`; server listens even if DB down | `await connectDB()` before `listen`; exit on fatal |
| 28 | 🔵 | DX | repo | `console.log("Verified")`, `"Verified2"`, `"hi"`, `"hello"` left in code; secrets‑ish `console.log(backendUrl)` | Structured logger (pino), strip debug logs |
| 29 | 🔵 | DX | [.gitignore](.gitignore) | Only `node_modules` + `*.env`; no `dist`, `.vercel`, `coverage`, `.DS_Store`; no `.env.example` committed | Expand ignore list; add `.env.example` per app |
| 30 | 🔵 | Repo hygiene | git log | Commits: "first commit", "first commit~", "Readme.md" | Conventional Commits + PR workflow |

---

## 6. Security Loopholes (consolidated)

1. **Broken payment verification** (Stripe redirect trust) and **client‑controlled pricing** — the two together allow free/underpriced orders.
2. **Token storage & lifetime** — `localStorage` + no expiry + no server‑side revocation. Add: httpOnly cookies, short access + rotating refresh, `jti` denylist on logout, device/session list.
3. **Admin model** — shared static secret, no RBAC, no MFA, no audit log, no brute‑force protection on `/api/user/admin`.
4. **Transport & headers** — open CORS, no `helmet` (no HSTS/CSP/X‑Frame‑Options), no HTTPS redirect enforced in app.
5. **Rate limiting / abuse** — none on auth, cart, or order endpoints; no CAPTCHA; no account lockout.
6. **Input validation** — no schema validation layer; NoSQL‑injection surface; `JSON.parse(sizes)` unguarded; file uploads unrestricted by size/type; `originalname` trusted.
7. **Secrets** — plaintext `.env`, no secret manager, `console.log` of config, `*.env` glob (commit `.env.example` only, never real secrets).
8. **PII** — addresses/phones stored unencrypted; no data‑retention or GDPR/DPDP deletion path; no field‑level encryption.
9. **Error leakage** — raw `error.message` returned to clients (stack/driver details).
10. **Dependency hygiene** — no `npm audit` in CI, no Dependabot/Renovate, no lockfile‑integrity gate.
11. **Idempotency** — no idempotency keys → double‑charge / duplicate orders on ret/retry.
12. **Authorization checks** — `userOrders` trusts `userId` from token (OK), but there's no object‑level check that an order belongs to the caller anywhere it matters; admin endpoints only gate on the shared secret.

---

## 7. Full‑Stack Improvement Backlog (by topic)

### 7.1 Backend / API design
- **Layered architecture**: `routes → controllers → services → repositories`; move business logic out of controllers.
- **Validation layer**: `zod` (or `joi`/`express-validator`) DTOs on every route; centralized `validate(schema)` middleware.
- **Consistent envelope + status codes**: `{ data, error, meta }`, real HTTP codes, `AppError` class, global error middleware, `express-async-errors`.
- **Pagination & filtering**: cursor‑based (`?limit=&cursor=`) for products/orders; `?q=&category=&sort=&minPrice=` handled in Mongo with indexes.
- **Env validation**: `envalid`/`zod` — fail fast on boot if a var is missing.
- **Config module**: single typed `config` object; no `process.env` reads scattered around.
- **API versioning**: `/api/v1/...`.
- **OpenAPI/Swagger** spec + `swagger-ui-express`; generate a Postman collection.
- **Rate limiting + slow‑down + helmet + compression + hpp + mongo‑sanitize**.
- **Graceful shutdown** (`SIGTERM` → drain → close Mongo), `/healthz` & `/readyz`.
- **Idempotency‑Key** middleware for POST `/order/*`.
- **Webhooks** for Stripe & Razorpay with signature verification and a raw‑body route.
- **Background jobs**: BullMQ (Redis) for email, payment reconciliation, low‑stock alerts, scrapers.

### 7.2 Database / data modeling
- `timestamps: true` on all schemas; migrate `date: Number` → `Date`.
- **Indexes**: `product` on `{category:1, subCategory:1}`, `{ name: 'text', description: 'text' }`, `{ bestSeller: 1 }`, `{ price: 1 }`; `order` on `{ userId: 1, createdAt: -1 }`, `{ status: 1 }`.
- **New collections**: `Review`, `Category`, `Coupon`, `Inventory`/variant stock, `AdminUser`, `AuditLog`, `Address` (normalized), `WebhookEvent`, `ScrapeSnapshot`.
- **Order line snapshot**: persist `{ productId, name, priceAtPurchase, qty, size }` computed server‑side.
- **Soft deletes** (`deletedAt`) instead of hard `findByIdAndDelete`.
- **Referential care**: store `userId`/`productId` as `ObjectId` refs, not `String`.
- **Migrations**: `migrate-mongo`.
- **Seed script** for local dev (products currently only in `assets.js`).

### 7.3 Auth & sessions
- Access/refresh tokens, httpOnly cookies, rotation + reuse detection, logout revocation list (Redis).
- Password reset (email token), email verification, optional TOTP MFA for admin.
- `bcrypt` cost tuning / migrate to `argon2`.
- RBAC (`user`, `admin`, `support`) + per‑route `authorize(...roles)`.
- Lockout / exponential backoff on failed logins; breached‑password check (k‑anonymity HIBP range API — no key needed).

### 7.4 Frontend
- **Data layer**: TanStack Query (caching, retries, background refetch, pagination, optimistic updates with rollback) — replaces most manual `useEffect` fetching.
- **Routing**: protected route wrapper, `*` NotFound, `/profile`, error boundaries, `Suspense` + code‑splitting (`React.lazy`).
- **Forms**: `react-hook-form` + `zod` resolver; disable submit while pending; inline field errors.
- **State**: keep Context for UI, move server state to Query; guest cart persisted + merged on login.
- **A11y**: real `<button>` for clickable icons, `aria-label`s, focus states, keyboard nav for menus/filters, meaningful `alt`.
- **Perf**: `loading="lazy"` + `srcset`/Cloudinary transforms (`f_auto,q_auto,w_400`), skeletons, list virtualization for big grids, `React.memo` on `ProductItem`, debounce search.
- **SEO/Share**: `react-helmet-async` (title/OG/Twitter/JSON‑LD `Product`), sitemap, prerender or migrate to Next.js for SSR/ISR.
- **PWA**: installable, offline catalog cache, add‑to‑cart offline queue.
- **Content**: replace all Lorem ipsum (About, Contact, LatestCollection, Product description tab).
- **Design system**: extract Tailwind tokens, dark mode, `<Button>/<Input>/<Badge>` primitives, Storybook.

### 7.5 Testing
- **Unit**: Vitest + RTL (components, `ShopContext` reducers, price/cart math).
- **API**: Jest/Vitest + Supertest + `mongodb-memory-server`; contract tests for payment flows with Stripe/Razorpay mocks.
- **E2E**: Playwright — register → browse → add to cart → checkout (COD) → see order; admin add product → appears in storefront.
- **Coverage gate** (e.g. 70%) in CI; mutation testing (Stryker) on the pricing module.

### 7.6 DevOps / delivery
- **Dockerfile** per app + `docker-compose` (api + Mongo + Redis) for one‑command local dev.
- **Monorepo tooling**: pnpm workspaces + Turborepo (shared `eslint-config`, `tsconfig`, `types`).
- **GitHub Actions**: lint → typecheck → test → build → `npm audit` → deploy; preview envs per PR.
- **Pre‑commit**: Husky + lint‑staged + commitlint.
- **IaC**: Terraform for Mongo Atlas / Cloudflare / Vercel config; environment parity.
- **TypeScript** migration (start with backend `services/` and shared `types`).

### 7.7 Observability
- Structured logging (pino) + request IDs (`cls-hooked`/`AsyncLocalStorage`).
- Metrics: `prom-client` (RED metrics, payment success rate, checkout funnel) → Grafana.
- Tracing: OpenTelemetry → Jaeger/Tempo.
- Error tracking: Sentry (frontend + backend).
- Uptime + synthetic checkout monitor; alerting (PagerDuty/Slack).
- Product analytics: PostHog (self‑host) — funnels, retention, feature flags.

---

## 8. System Design Deep‑Dive (what a senior would propose)

Use these as **whiteboard talking points**; each maps to a real gap above.

### 8.1 Scaling the catalog read path
- **CDN** for images (Cloudinary/Cloudflare) with `f_auto,q_auto` + long cache TTL + content hashing.
- **Redis cache‑aside** for `GET /products` and product detail; invalidate on admin write (pub/sub or short TTL). Target p99 < 50ms for catalog.
- **Search**: move off in‑browser filtering to **MongoDB Atlas Search** or **Meilisearch/Typesense/OpenSearch** — typo tolerance, facets, synonyms, relevance ranking, autocomplete.
- **Pagination**: cursor‑based to keep deep pages O(1); precomputed "sort keys".
- **Read replicas** / secondary‑preferred reads for catalog; primary for checkout.

### 8.2 Checkout & payments (correctness under failure)
- **Server‑authoritative pricing**: cart priced from DB at "create order"; coupons/tax/shipping computed server‑side.
- **Idempotency keys** on order creation and payment capture.
- **Webhook‑driven state machine**: `PENDING → AUTHORIZED → PAID → FULFILLED / FAILED / REFUNDED`; the redirect page only *displays* status, webhooks *drive* it.
- **Saga / outbox**: order write + inventory reservation + cart clear as a saga with compensating actions; `WebhookEvent` + `outbox` collection consumed by a worker.
- **Inventory reservation**: decrement with `findOneAndUpdate({ _id, stock: { $gte: qty }}, { $inc: { stock: -qty }})` (optimistic, atomic); TTL‑release unpaid reservations.
- **Reconciliation job**: nightly compare local orders vs Stripe/Razorpay; flag mismatches.
- **Dead‑letter queue** for failed webhook processing.

### 8.3 Auth at scale
- Stateless access JWT (RS256, short TTL) + refresh token rotation with reuse detection; Redis denylist for `jti`.
- Session/device management UI; forced logout on password change.
- API gateway does coarse auth + rate limiting; services do fine‑grained RBAC.

### 8.4 Asynchronous workloads
- **Queue** (BullMQ/Redis or SQS): order‑confirmation email, invoice PDF, low‑stock alerts, **all scrapers** (§9), recommendation recompute, sitemap regen.
- **Scheduler** (cron / Temporal) for periodic price scrapes, trend refresh, cache warmups.
- **Rate‑limit + circuit breaker** (`opossum`) around every third party (Stripe, Cloudinary, scrape targets).

### 8.5 Reliability & ops
- Health/readiness probes, graceful shutdown, connection pooling limits.
- Blue‑green / canary deploys; DB migrations gated and reversible.
- Backups + tested restore; RPO/RTO targets; multi‑AZ Atlas; optional multi‑region active‑passive.
- Feature flags for risky rollouts (new checkout, new pricing engine).
- Load testing (k6) of the checkout funnel; capacity model.

### 8.6 Security posture
- WAF + bot management + DDoS protection at the edge.
- Secrets manager (Vault / Doppler / AWS SM); no secrets in env files.
- SAST/DAST + dependency scanning in CI; SBOM.
- PII encryption at rest (field‑level), tokenized addresses, audit log, data‑subject deletion workflow.

### 8.7 Suggested target architecture (modular monolith → selective services)

```
Edge (Cloudflare: WAF, CDN, cache)
        │
   API Gateway  ── authN, rate limit, request id
        │
  ┌─────┴─────────────────────────────────────────┐
  │ Modular monolith (Express/Nest)               │
  │  modules: catalog · cart · checkout · orders  │
  │           reviews · users · admin · pricing   │
  └───┬───────────┬──────────────┬────────────────┘
      │           │              │
   MongoDB     Redis          BullMQ workers
  (Atlas)   (cache, locks,   (email, scrapers, recompute,
            sessions, rl)     reconciliation, webhooks)
      │
  Search engine (Atlas Search / Meilisearch)
      │
  Object storage / CDN (Cloudinary)
```
Split **pricing/scraping** and **search‑indexer** into workers first; extract a true service only when a module needs independent scaling.

---

## 9. New Features — AI via Web Scraping + Classical ML (no LLM API keys, no paid tokens)

All of these use **open‑source Node/Python libraries** and **your own scraping pipeline** — no Anthropic/OpenAI/Gemini keys, no per‑token cost.

**Shared scraping infrastructure**
- Scrapers: `playwright` / `puppeteer` (JS‑rendered sites) + `cheerio` + `got-scraping` (static); rotate user‑agents, respect `robots.txt`, throttle, cache raw HTML in `ScrapeSnapshot`.
- Run every scraper as a **BullMQ job on a cron** (never in a request); circuit‑breaker + retry/backoff; store normalized results, not live‑fetch on page load.
- Persist provenance (`source`, `scrapedAt`, `rawHash`) for every derived field.

| # | Feature | How it works (no LLM) | Libraries |
|---|---|---|---|
| 1 | **Competitor price tracking + dynamic pricing** | Nightly scrape 2–3 marketplaces for matched SKUs/keywords; store price history; show "Lowest in 30 days" / "₹X cheaper than market" badges; suggest admin repricing rules (undercut by %, floor = cost×margin). | playwright, cheerio, `simple-statistics` (trend, percentile) |
| 2 | **Auto product enrichment** | Admin pastes a brand/manufacturer product URL → scrape title, bullet specs, size chart, hi‑res images, material → pre‑fill the "Add Product" form. Kills the Lorem‑ipsum descriptions. | cheerio, `@mozilla/readability` + `jsdom`, `sharp` |
| 3 | **External review & rating aggregation** | Scrape star ratings + review text for the same product from public sources; compute a **real** aggregate rating (currently hard‑coded 4★/122) and a distribution histogram. | cheerio, `natural` |
| 4 | **Review sentiment + aspect summary** | Local sentiment scoring (VADER / AFINN) + noun‑phrase aspect extraction ("fabric", "fit", "delivery") → "Customers praise fit, mention thin fabric". Pure lexicon/POS, no model API. | `vader-sentiment`, `wink-nlp`, `compromise` |
| 5 | **"True to size" recommender** | Mine scraped + local reviews for fit phrases ("runs small/large", "size up") → per‑product fit score → "Most buyers say: order one size up". | regex rules + `natural` Bayes on a labeled seed set |
| 6 | **Content‑based "Similar products"** | TF‑IDF over `name + description + category + scraped specs`, cosine similarity → related items (replaces naive category match in `RelatedProducts`). | `natural` (`TfIdf`), `ml-distance` |
| 7 | **"Frequently bought together"** | Offline **association‑rule mining (Apriori/FP‑Growth)** over historical `order.items` → basket recommendations + bundle discounts. | `node-apriori` / custom, `simple-statistics` |
| 8 | **Personalized "For you" rail** | Item‑item collaborative filtering (co‑view / co‑purchase matrix) computed nightly per user; cold‑start falls back to content‑based + trending. | matrix math in JS, cron job |
| 9 | **Trend detection / auto "Trending" collection** | Scrape Google Trends (unofficial JSON), fashion subreddits, retailer "new in" pages → keyword momentum score → auto‑tag matching products `trending`, build a Trending page. | `google-trends-api`, `snoowrap`, `simple-statistics` (z‑score, slope) |
| 10 | **Visual search / dedupe / "shop this look"** | Perceptual hashing (pHash/dHash) of product + scraped images → "visually similar"; dominant‑color extraction → "shop by color" filter and palette chips. | `sharp`, `image-hash`, `node-vibrant` |
| 11 | **Typo‑tolerant search + autocomplete** | Local trie + fuzzy match + synonym list scraped from a fashion glossary; query‑log mining for popular searches. | `fuse.js`, `fast-levenshtein`, custom trie |
| 12 | **Retrieval FAQ chatbot (no LLM)** | TF‑IDF / BM25 retrieval over a knowledge base built by scraping *your own* policy/FAQ/product pages; intent classification with a small Naive Bayes; returns the best passage + link. | `natural` / `wink-bm25-text-search` |
| 13 | **Demand forecasting & restock alerts** | Holt‑Winters / moving average on order history per SKU → predicted 14‑day demand → low‑stock and reorder‑point alerts to admin. | `simple-statistics`, custom HW |
| 14 | **Fraud / fake‑review heuristics** | Rule + Bayes scoring: velocity, address/device reuse, mismatched geo, duplicated review text (shingling + Jaccard), burst detection → flag for manual review. | `natural`, `simhash`, rules engine |
| 15 | **Templated SEO description generator (NLG, not LLM)** | Fill Handlebars/`nunjucks` templates from structured (scraped) attributes → unique, keyword‑rich product copy + JSON‑LD. | `nunjucks`, attribute schema |
| 16 | **Image quality / moderation gate on upload** | Blur detection (variance of Laplacian), min‑resolution check, NSFW screen with a local model (`nsfwjs` / TensorFlow.js) before Cloudinary. | `sharp`, `nsfwjs`, `@tensorflow/tfjs-node` |
| 17 | **Size‑chart normalization** | Scrape brand size charts, parse tables, map to a unified S–XXL + cm range → consistent size guidance across brands. | cheerio, table parser |
| 18 | **Price‑drop / back‑in‑stock notifications** | Watchlist + scraper/inventory diff → email/push when price crosses threshold or stock returns (BullMQ scheduled). | BullMQ, nodemailer, web‑push |

**How to phrase the boundary in interviews:** "The 'AI' features are deterministic/statistical — scraping pipelines feeding TF‑IDF similarity, association‑rule mining, lexicon sentiment, perceptual hashing, and classical forecasting — so there's zero inference cost and full explainability. The architecture (queue + cron + snapshot store + circuit breakers) is the interesting part and it's LLM‑ready if we later add one."

---

## 10. Delivery Roadmap (phased)

**Phase 0 — Stop the bleeding (days)**
- Fix #1–#4, #8, #9 (payment forgery, client pricing, Stripe line items, Razorpay signature, adminAuth crash, Mongo URI).
- Add `helmet`, CORS allow‑list, `express-rate-limit` on auth, `zod` on order/product routes.
- JWT `expiresIn`; remove debug `console.log`s; fix toast CSS import; add `*` NotFound + `/profile`.

**Phase 1 — Foundations (2–3 weeks)**
- Error middleware + real status codes + response envelope; env validation; pino logging; `/healthz`.
- Inventory model + atomic reservation; server‑rebuilt order lines; Mongo transactions.
- Pagination + Mongo‑side filter/sort; text index; TanStack Query on the frontend.
- Vitest + Supertest + `mongodb-memory-server`; Playwright COD happy path; GitHub Actions (lint/test/build/audit).
- Dockerize; `.env.example`; seed script.

**Phase 2 — Product depth (3–5 weeks)**
- Refresh/rotation auth + httpOnly cookies; RBAC + real admin users + audit log; password reset/verify.
- Stripe & Razorpay webhooks + reconciliation worker; idempotency keys; coupons/tax/shipping engine.
- Reviews & ratings (real); wishlist; address book; order tracking timeline; email notifications (BullMQ + nodemailer).
- Redis cache‑aside for catalog; Cloudinary transforms + lazy loading; SEO (helmet‑async + JSON‑LD) or Next.js migration.

**Phase 3 — Differentiators (ongoing)**
- Scraping infra (§9 shared) + features #1, #2, #3/#4, #6, #7 first (highest ROI).
- Meilisearch/Atlas Search with facets + typo tolerance + autocomplete.
- Observability stack (Prometheus/Grafana/Sentry/OTel); PostHog funnels + feature flags.
- Demand forecasting + dynamic pricing; visual search; PWA.

---

## 11. Resume Bullets & Interview Talking Points (target: 20+ LPA full‑stack)

> Write these in past tense once implemented. Numbers are illustrative — replace with your measured values.

**Architecture & system design**
- Re‑architected a MERN e‑commerce platform from a controller‑heavy monolith into a **modular monolith** (`routes → controllers → services → repositories`) with a queue‑backed worker tier (BullMQ/Redis), cutting p95 API latency **X%** and isolating third‑party failures behind circuit breakers.
- Designed a **webhook‑driven order/payment state machine** with idempotency keys, an outbox/saga for inventory reservation + cart clearing, and a nightly reconciliation job — eliminating a class of **payment‑forgery and double‑charge bugs**.
- Introduced **cache‑aside with Redis** and CDN image transforms for the catalog read path, taking product‑list p99 from **~Xms to <50ms** and offloading **Y%** of DB reads.
- Replaced in‑browser filtering with **server‑side search (Meilisearch/Atlas Search)** — typo tolerance, facets, synonyms, autocomplete — over a **cursor‑paginated** API.

**Security**
- Closed critical vulnerabilities: **client‑controlled order totals**, **redirect‑trust payment confirmation**, non‑expiring `localStorage` JWTs, fully‑open CORS, and unvalidated file uploads.
- Implemented **short‑lived access + rotating refresh tokens in httpOnly cookies** with reuse detection and a Redis revocation list; added **RBAC**, admin **MFA**, audit logging, and `express-rate-limit`/`helmet`/input‑schema validation (`zod`).

**Backend**
- Standardized the API on real HTTP status codes, a `{ data, error, meta }` envelope, centralized async error handling, `envalid` boot‑time config validation, OpenAPI docs, and `/healthz`/`/readyz` with graceful shutdown.
- Added an **atomic inventory reservation** pattern (`findOneAndUpdate` with `$gte` guard + TTL release) to prevent overselling under concurrency.

**Frontend**
- Migrated data fetching to **TanStack Query** (caching, retries, optimistic updates with rollback), added route‑level code‑splitting, error boundaries, `react-hook-form`+`zod` forms, and an accessible component library (WCAG AA, keyboard nav).
- Improved Core Web Vitals via lazy/`srcset` images, list virtualization, and skeletons; added SSR/ISR (Next.js) + JSON‑LD for **X%** organic‑traffic lift.

**Data / ML‑style features (no LLM cost)**
- Built a **Playwright + Cheerio scraping pipeline** (cron + BullMQ + snapshot store + provenance) powering competitor price tracking, automated product enrichment, and external review aggregation.
- Shipped **content‑based and collaborative recommendations** (TF‑IDF cosine similarity + Apriori association‑rule mining over order baskets) and **lexicon‑based review sentiment/aspect summaries**, lifting recommendation CTR **X%** with **zero inference cost** and full explainability.
- Implemented **Holt‑Winters demand forecasting** for restock alerts and a **rules + Naive‑Bayes fraud/fake‑review classifier**.

**Quality & delivery**
- Established the test pyramid (Vitest + RTL, Supertest + `mongodb-memory-server`, Playwright E2E) at **70%+ coverage** with a CI gate; added GitHub Actions (lint → typecheck → test → `npm audit` → preview deploy), Husky/commitlint, Dockerized dev (`api + mongo + redis`), and pnpm/Turborepo workspaces.
- Added observability: pino structured logs with request IDs, Prometheus RED metrics + Grafana dashboards (checkout funnel, payment success rate), OpenTelemetry tracing, and Sentry.

**Interview topics this project now lets you speak to:** JWT vs session auth & refresh‑token rotation; XSS/CSRF trade‑offs of token storage; idempotency & exactly‑once payment processing; saga vs 2PC; optimistic concurrency & inventory reservation; cache invalidation strategies; cursor vs offset pagination; search engine selection & relevance tuning; queue‑based decoupling & DLQs; circuit breakers/bulkheads; observability (RED/USE, tracing); CI/CD & trunk‑based dev; content‑based vs collaborative filtering; association‑rule mining; scraping at scale (robots, throttling, rotation, dedupe via shingling/pHash).

---

## 12. Quick‑Wins Checklist (copy into issues)

- [ ] Verify Stripe payment server‑side (`sessions.retrieve` + webhook) — [orderController.js](backend/controllers/orderController.js)
- [ ] Recompute order `amount` from DB; ignore client value — `placeOrder*`
- [ ] Fix Stripe `unit_amount` to `item.price * 100` — `placeOrderStripe`
- [ ] Verify `razorpay_signature` HMAC — `verifyRazorPayment`
- [ ] `createToken` → add `{ expiresIn: '7d' }` (then refresh tokens) — [userController.js](backend/controllers/userController.js)
- [ ] `adminAuth` catch: `error.message` not `err.message` — [adminAuth.js](backend/middleware/adminAuth.js)
- [ ] `mongoose.connect(uri, { dbName: 'ecommerce' })` — [config/mongodb.js](backend/config/mongodb.js)
- [ ] `multer.memoryStorage()` + `upload_stream` + `limits`/`fileFilter` — [middleware/multer.js](backend/middleware/multer.js)
- [ ] `helmet()`, CORS allow‑list, `express-rate-limit` on `/api/user/*`, `express-mongo-sanitize` — [server.js](backend/server.js)
- [ ] `zod` validation on product/order/cart bodies; `isValidObjectId` guards
- [ ] Central error middleware + real HTTP status codes
- [ ] `timestamps: true` + indexes on all models; `date: Number` → `Date`
- [ ] Frontend: `react-toastify/dist/ReactToastify.css`; add `*` NotFound + `/profile`; keys on mapped rows; remove `{ all }` import; controlled cart qty input
- [ ] Persist guest cart to `localStorage` + merge on login; refetch cart in login handler; rollback optimistic add on failure
- [ ] Replace hard‑coded ratings/reviews with a `Review` model + aggregate
- [ ] Remove debug `console.log`s; add pino; commit `.env.example`; expand `.gitignore`
- [ ] Add Vitest + Supertest + Playwright + GitHub Actions CI
