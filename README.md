# 🍽️ DineOps

**A multi-restaurant, role-based ordering & operations management platform.**

DineOps is a full-stack MERN application that lets restaurant chains manage restaurants, menus, staff, and orders across multiple countries — with strict role-based access control and country-scoped data isolation. It is **not** a delivery/logistics app (no riders, no live tracking) — it's an **ordering + operations backend** for restaurants, closer to a restaurant management system than a food-delivery service.

---

## ✨ What It Actually Does

| Role | Can do |
|---|---|
| **ADMIN** | Full control — manage restaurants, menus, users, managers, orders, and payment methods across **all countries** |
| **MANAGER** | Owns and operates restaurant(s) in **their own country only** — views and manages that scope's orders |
| **MEMBER** | Customer role — browses restaurants/menus in their country, adds items to a cart, places orders, cancels unpaid orders |

The standout architectural feature is **country-based multi-tenancy**: a single shared database, with every restaurant, menu, and order scoped by country (`INDIA` / `AMERICA`), automatically filtered per-request based on the logged-in user's role and country — so a Manager or Member never sees another country's data, while an Admin (or a user flagged `GLOBAL`) sees everything.

---

## 🧱 Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (access + refresh tokens) via `jsonwebtoken`, stored in httpOnly cookies
- `bcrypt` for password hashing
- Custom `ApiError` / `ApiResponse` wrapper classes + `asyncHandler` for clean async error handling

**Frontend**
- React 19 + Vite 7
- React Router v7 (role-based protected routes)
- TanStack React Query (server state, caching, mutations)
- Axios (shared instance with a request interceptor that auto-attaches the JWT)
- Context API (cart state)
- Tailwind CSS v4

---

## 🔐 Roles & Permissions

Authorization is enforced in two layers on the backend:

1. **Role-based route guards** (`authorizeRoles`) — coarse-grained: "only these roles may hit this route at all."
2. **Action-based permission map** (`checkPermission`) — fine-grained: maps a specific action to the roles allowed to perform it, independent of route structure.

### Action Permission Matrix

| Action | ADMIN | MANAGER | MEMBER |
|---|:---:|:---:|:---:|
| View restaurants & menu | ✅ | ✅ | ✅ |
| Create an order | ✅ | ✅ | ✅ |
| Place (pay for) an order | ✅ | ✅ | ❌ |
| Cancel an order | ✅ | ✅ | ❌ |
| Update an order's payment method | ✅ | ❌ | ❌ |

### Route-Level Role Access

| Resource / Route | ADMIN | MANAGER | MEMBER |
|---|:---:|:---:|:---:|
| `POST /users/register`, `POST /users/login` | ✅ (public) | ✅ (public) | ✅ (public) |
| `GET /users/all-users` | ✅ | ❌ | ❌ |
| `POST /users/create-manager` | ✅ | ❌ | ❌ |
| `DELETE /users/delete-user/:id` | ✅ | ❌ | ❌ |
| `POST /resturants` (create) | ✅ | ❌ | ❌ |
| `PUT /resturants/:id` (update) | ✅ | ❌ | ❌ |
| `DELETE /resturants/:id` (soft delete) | ✅ | ❌ | ❌ |
| `GET /resturants` (list, country-scoped) | ✅ (all) | ✅ (own country) | ✅ (own country) |
| `POST /menu/:resturantId` (create item) | ✅ | ❌ | ❌ |
| `PUT /menu/item/:menuId` (update item) | ✅ | ❌ | ❌ |
| `DELETE /menu/item/:menuId` (delete item) | ✅ | ❌ | ❌ |
| `GET /orders/all` (all orders, country-scoped) | ✅ (all) | ✅ (own country) | ❌ |
| `GET /orders/my-orders` | ✅ | ✅ | ✅ |
| `PATCH /orders/:id/payment` | ✅ | ❌ | ❌ |

> **Data isolation note:** Rows marked "own country" are enforced by the `countryFilter` middleware, which sets an empty filter (see-all) for `ADMIN` or any user with `country: GLOBAL`, and a `{ country }` filter for everyone else.

---

## 📁 Project Structure

```
├── backend
│   ├── src
│   │   ├── config/           # Env loading
│   │   ├── controllers/      # Business logic (menu, order, restaurant, user)
│   │   ├── db/                # MongoDB connection
│   │   ├── middlewares/      # auth (JWT), role/permission checks, country filtering
│   │   ├── models/            # Mongoose schemas (User, Resturant, MenuItem, Order, Payment, Product)
│   │   ├── routes/            # Express route definitions
│   │   ├── seed/              # Scripts to populate sample data
│   │   ├── utils/             # ApiError, ApiResponse, asyncHandler
│   │   ├── app.js             # Express app + middleware wiring
│   │   └── index.js           # Server entry point
│   └── package.json
└── frontend
    ├── src
    │   ├── api/                # Axios-based API modules (per resource)
    │   ├── components/        # AdminDashboard, ManagerDashboard, MemberDashboard, Navbar, ProtectedRoute
    │   ├── context/            # CartContext (Context API)
    │   ├── hooks/              # useLogin (React Query mutation + role-based redirect)
    │   ├── pages/              # LoginPage
    │   ├── App.jsx             # Route definitions
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# create a .env file — see Environment Variables below
npm run seed   # optional: populate sample users/restaurants/menu/orders
npm run dev    # starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
# create a .env file with VITE_API_BASE_URL
npm run dev    # starts on http://localhost:5173
```

### Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🗺️ Core Data Models

| Model | Key Fields |
|---|---|
| **User** | `name`, `email`, `password` (hashed, hidden), `role` (`ADMIN`/`MANAGER`/`MEMBER`), `country` (`INDIA`/`AMERICA`/`GLOBAL`) |
| **Resturant** | `name`, `address`, `country`, `isActive`, `manager` (ref → User) |
| **MenuItem** | `resturant` (ref), `name`, `description`, `price`, `isAvailable` |
| **Order** | `user` (ref), `restaurant` (ref), `items[]`, `status` (`CREATED`/`PAID`/`CANCELLED`), `totalAmount`, `paymentMethod`, `country` |
| **Payment** | `order` (ref), `user` (ref), `amount`, `paymentMethod`, `paymentStatus`, `transactionId`, `gateway` |

---

## 🧭 Order Lifecycle

```
CREATED ──(place)──▶ PAID
   │
   └──(cancel)──▶ CANCELLED
```
A paid order cannot be cancelled, and an already-processed order cannot be paid again.

---

## 🔭 Known Limitations & Roadmap

- No delivery/rider/logistics tracking — scope is deliberately restaurant ordering & operations, not last-mile delivery.
- No global Express error-handling middleware yet to standardize error responses.
- Order totals are currently client-supplied and should be recalculated server-side from live menu prices.
- No refresh-token endpoint yet to reissue access tokens.
- Planned: forgot-password / OTP-based password reset flow, pagination on list endpoints, and consolidation of duplicate frontend API modules.

---

## 📄 License

ISC
