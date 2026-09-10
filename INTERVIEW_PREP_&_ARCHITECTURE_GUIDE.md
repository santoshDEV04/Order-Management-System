# 🛡️ RBAC Sentinel — Enterprise Access Control System
## Complete Architecture Guide & Interview Master Blueprint

---

## 📌 1. Project Overview & Architecture

### What Was Built
A production-grade **Multi-Role Food Delivery Platform** demonstrating enterprise security patterns:
- **Authentication**: JWT-based stateless auth with HTTP-Only cookies
- **Authorization (RBAC)**: Role-Based Access Control enforced at API middleware layer
- **Data Isolation (ABAC)**: Attribute-Based Access Control using geographic `country` scoping
- **Dual Theme Engine**: Runtime Light/Dark mode via CSS custom properties

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS 4, TanStack React Query v5 |
| Backend | Node.js, Express.js v5, Mongoose ORM |
| Database | MongoDB with Mongoose schema validation & indexing |
| Auth | JWT (jsonwebtoken), bcryptjs, HTTP-Only Cookies |
| UI | lucide-react icons, Inter (Google Fonts), CSS Variables |

### Application Pages & Routes
| Route | Component | Access | Description |
|---|---|---|---|
| `/` | `LoginPage.jsx` | Public | Persona quick-switcher + manual credential login |
| `/admin` | `AdminDashboard.jsx` | ADMIN only | User management, policy sandbox, restaurant CRUD |
| `/manager` | `ManagerDashboard.jsx` | MANAGER only | Order placement, GST/tax engine, cart checkout |
| `/member` | `MemberDashboard.jsx` | MEMBER only | Catalog browser, draft cart, restriction enforcer |
| `/analytics` | `AnalyticsPage.jsx` | ADMIN, MANAGER | Business KPIs, regional revenue distribution |
| `/audit-logs` | `AuditLogsPage.jsx` | ADMIN, MANAGER | Security event trace, IP logging, CSV export |
| `/profile` | `ProfilePage.jsx` | All authenticated | JWT session inspector, 2FA toggle, password update |

---

## 🏗️ 2. Architecture & Data Flow

### 2.1 Authentication Flow
```
User Submits Credentials
  ↓
POST /api/auth/login
  ↓
Express Controller: validateBody → findUserByEmail
  ↓
bcrypt.compare(password, hash) → verify password
  ↓
jwt.sign({ userId, role, country }, JWT_SECRET, { expiresIn: '7d' })
  ↓
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
  ↓
Response: { user: { name, email, role, country } }
  ↓
Frontend: localStorage.setItem('user', JSON.stringify(user))
  ↓
React Router redirects → role-specific dashboard
```

### 2.2 RBAC Middleware Flow
```
Incoming API Request (e.g. POST /api/orders/place)
  ↓
protect middleware → extract token from cookie/header
  ↓
jwt.verify(token, JWT_SECRET) → decode { userId, role, country }
  ↓
req.user = decoded payload
  ↓
checkPermission('place_order') middleware
  ↓
PERMISSIONS['place_order'].includes(req.user.role) ?
  → YES → next() → Controller executes
  → NO  → res.status(403).json({ error: 'Forbidden' })
```

### 2.3 ABAC Country Scoping Flow
```
Authenticated User (MANAGER, country: "INDIA") requests GET /api/restaurants
  ↓
protect middleware sets req.user.country = "INDIA"
  ↓
Controller: const countryFilter = user.role === 'ADMIN' ? {} : { country: user.country }
  ↓
Restaurant.find(countryFilter) → returns only INDIA restaurants
  ↓
ADMIN: sees ALL restaurants (global scope)
MANAGER: sees INDIA restaurants only
MEMBER: sees INDIA restaurants only
```

### 2.4 Permission Matrix
| Action | ADMIN | MANAGER | MEMBER |
|---|:---:|:---:|:---:|
| view_restaurant | ✅ | ✅ | ✅ |
| create_order (draft) | ✅ | ✅ | ✅ |
| place_order (checkout) | ✅ | ✅ | ❌ |
| cancel_order | ✅ | ✅ | ❌ |
| update_payment | ✅ | ❌ | ❌ |
| manage_users | ✅ | ❌ | ❌ |
| view_all_data (global) | ✅ | ❌ | ❌ |

---

## ❓ 3. Technical Interview Questions & Answers

---

### 🔐 CATEGORY A — JWT & Authentication

---

**Q1. How does JWT authentication work in your project?**

> **Answer:**
> When a user logs in, the server validates credentials and creates a JWT using `jwt.sign({ userId, role, country }, JWT_SECRET, { expiresIn: '7d' })`. This token is sent via `Set-Cookie` as an HTTP-Only cookie and also returned in the response body. On every subsequent request, our `protect` middleware extracts the token from the cookie or `Authorization: Bearer` header, verifies it using `jwt.verify()`, and attaches the decoded payload to `req.user`. The token is **stateless** — no session is stored on the server.

---

**Q2. Why use HTTP-Only cookies for JWT instead of localStorage?**

> **Answer:**
> `localStorage` is accessible via JavaScript API, making tokens vulnerable to **XSS (Cross-Site Scripting)** attacks. If malicious JS is injected into the page, it can steal the token and impersonate the user. HTTP-Only cookies are **inaccessible to JavaScript** — only the browser sends them automatically. We also set `SameSite=Strict` to prevent **CSRF (Cross-Site Request Forgery)** attacks.

---

**Q3. What does a decoded JWT payload look like in your system?**

> **Answer:**
> ```json
> {
>   "userId": "64a8f1c2e5b3d9001f2a3b4c",
>   "role": "MANAGER",
>   "country": "INDIA",
>   "iat": 1720000000,
>   "exp": 1720604800
> }
> ```
> `iat` = issued at (Unix timestamp), `exp` = expiry. The middleware uses this to reconstruct `req.user` without any DB lookup on every request.

---

**Q4. What happens when a JWT token expires?**

> **Answer:**
> `jwt.verify()` throws a `TokenExpiredError`. Our `protect` middleware catches this and returns a `401 Unauthorized` response. The frontend's React Query error handler intercepts this, clears localStorage, and redirects the user to `/login`. We could optionally implement a **refresh token** pattern using a long-lived refresh token stored in an HTTP-Only cookie to silently renew access tokens.

---

**Q5. What is the difference between authentication and authorization?**

> **Answer:**
> - **Authentication**: "Who are you?" — Verifying identity (login with email + password, JWT validation).
> - **Authorization**: "What can you do?" — Checking permissions (RBAC: can this role call this endpoint?). In our system, `protect` middleware handles authentication, and `checkPermission()` middleware handles authorization.

---

**Q6. How is the password stored securely?**

> **Answer:**
> Passwords are hashed using **bcryptjs** with a **salt rounds factor of 10** before storage in MongoDB. `bcrypt.hash(password, 10)` generates a one-way salted hash. On login, `bcrypt.compare(plainPassword, storedHash)` is used — we **never** store or transmit plain text passwords. Salt prevents **rainbow table attacks**.

---

**Q7. How would you implement token refresh without forcing logout?**

> **Answer:**
> Issue two tokens:
> 1. **Access Token**: short-lived (15 minutes), stored in memory or `Authorization` header.
> 2. **Refresh Token**: long-lived (7 days), stored in HTTP-Only cookie.
>
> When the access token expires, the frontend silently calls `POST /api/auth/refresh`. The server validates the refresh token and issues a new access token. This is the **sliding session** pattern used by most enterprise applications.

---

### 🛡️ CATEGORY B — RBAC & ABAC Architecture

---

**Q8. Explain the difference between RBAC and ABAC.**

> **Answer:**
> - **RBAC (Role-Based Access Control)**: Permissions are assigned to **roles**, and users are assigned roles. It's static — a MANAGER can always cancel orders regardless of context.
> - **ABAC (Attribute-Based Access Control)**: Permissions are determined by **user attributes, resource attributes, and environment context**. In our system, a MANAGER in INDIA can only see INDIA restaurants — the `country` attribute filters database queries dynamically.
>
> Our system uses **hybrid RBAC + ABAC**: RBAC governs what _actions_ are allowed, ABAC governs what _data_ is accessible.

---

**Q9. Walk me through the `checkPermission` middleware implementation.**

> **Answer:**
> ```js
> const PERMISSIONS = {
>   view_restaurant:  ['ADMIN', 'MANAGER', 'MEMBER'],
>   place_order:      ['ADMIN', 'MANAGER'],
>   update_payment:   ['ADMIN'],
>   manage_users:     ['ADMIN'],
> };
>
> const checkPermission = (action) => (req, res, next) => {
>   const allowedRoles = PERMISSIONS[action] || [];
>   if (!allowedRoles.includes(req.user.role)) {
>     return res.status(403).json({ error: 'Forbidden' });
>   }
>   next();
> };
> ```
> This is a **middleware factory** — `checkPermission('place_order')` returns a new middleware function. It reads `req.user.role` (set by the `protect` middleware) and compares against the allowlist.

---

**Q10. How does country-based ABAC data scoping work technically?**

> **Answer:**
> ```js
> const getRestaurants = async (req, res) => {
>   const countryFilter = req.user.role === 'ADMIN'
>     ? {}                                       // Admin sees ALL
>     : { country: req.user.country };           // Others see own country
>   const restaurants = await Restaurant.find(countryFilter);
>   res.json(restaurants);
> };
> ```
> The country attribute from the JWT payload dynamically constructs the Mongoose query filter. ADMIN gets `{}` (no filter = global), while MANAGER/MEMBER get `{ country: "INDIA" }`.

---

**Q11. How do you prevent privilege escalation in this system?**

> **Answer:**
> Multiple defense layers:
> 1. **JWT-signed role** — the role is encoded in a cryptographically signed token, tamper-proof without the secret.
> 2. **Server-side validation** — every endpoint re-verifies `req.user.role` from the JWT, never trusting client-sent data.
> 3. **Cascading middleware** — every protected route must pass `protect` then `checkPermission`, in order.
> 4. **Role hierarchy enforcement** — only ADMINs can call `createManager`, preventing MANAGER self-elevation.

---

**Q12. What is the Principle of Least Privilege and how is it applied here?**

> **Answer:**
> Users should only have access to what they strictly need:
> - **MEMBERs** can browse and build carts, but **cannot place orders** or access financial data.
> - **MANAGERs** can place and cancel orders in their country only — they **cannot see other countries' data or manage users**.
> - **ADMINs** have global access. We could further restrict destructive admin operations to require re-authentication.

---

**Q13. How would you extend RBAC to support resource-level permissions?**

> **Answer:**
> Add **ownership checks** alongside role checks:
> ```js
> const order = await Order.findById(req.params.id);
> if (req.user.role === 'MANAGER' && order.userId !== req.user.userId) {
>   return res.status(403).json({ error: 'Can only cancel own orders' });
> }
> ```
> For complex policies, use **PBAC engines** like **Casbin** or **OPA (Open Policy Agent)**.

---

### ⚡ CATEGORY C — Express.js & Middleware

---

**Q14. What is Express middleware and how does the middleware chain work?**

> **Answer:**
> Middleware are functions with signature `(req, res, next)`. Express chains them in declaration order. Each can execute code, modify `req`/`res`, call `next()` to pass to the next middleware, or end the cycle.
>
> In our route: `router.post('/place', protect, checkPermission('place_order'), placeOrderController)` — the request passes through `protect` → `checkPermission` → controller, or short-circuits with `res.status(403)`.

---

**Q15. What's new in Express v5 and why did you use it?**

> **Answer:**
> Key Express v5 improvements:
> - **Async error propagation**: `async` route handlers automatically propagate thrown errors to `next(err)` without manual try/catch.
> - **Path matching**: More predictable routing.
>
> In our code, we write `router.get('/', async (req, res) => { const data = await Model.find(); res.json(data); })` without try/catch — errors propagate to global error middleware automatically.

---

**Q16. How does your global error handler work?**

> **Answer:**
> ```js
> // Must have 4 parameters to be recognized as error middleware
> app.use((err, req, res, next) => {
>   const status = err.status || 500;
>   const message = err.message || 'Internal Server Error';
>   res.status(status).json({ error: message });
> });
> ```
> Catches any error thrown or passed to `next(err)` in any route, centralizing error formatting and preventing stack trace leakage.

---

**Q17. What is CORS and how is it configured for this app?**

> **Answer:**
> CORS prevents unauthorized cross-origin requests. We configure it to only allow our frontend origin:
> ```js
> app.use(cors({
>   origin: 'http://localhost:5173',   // Vite dev server
>   credentials: true,                  // Allow HTTP-Only cookies
>   methods: ['GET', 'POST', 'PUT', 'DELETE'],
> }));
> ```
> `credentials: true` is critical — without it, the browser won't include HTTP-Only cookies in cross-origin requests.

---

**Q18. What is the difference between PUT and PATCH in REST APIs?**

> **Answer:**
> - **PUT**: Replace the entire resource. Send all fields.
> - **PATCH**: Partial update. Send only changed fields.
>
> In our `updatePayment` endpoint, we use **PATCH** because we only update `paymentStatus` on an order, not the entire document.

---

**Q19. What is the difference between synchronous and asynchronous middleware?**

> **Answer:**
> - **Sync**: `(req, res, next) => { doSomething(); next(); }`
> - **Async (old pattern)**: Requires manual try/catch: `async (req, res, next) => { try { ... } catch(e) { next(e); } }`
> - **Async (Express v5)**: No try/catch needed — unhandled promise rejections automatically propagate to error handlers.
>
> Express v5 was chosen specifically for this automatic async error propagation.

---

### 🍃 CATEGORY D — MongoDB & Mongoose

---

**Q20. How does Mongoose schema validation protect the database?**

> **Answer:**
> ```js
> const userSchema = new Schema({
>   email: { type: String, required: true, unique: true, lowercase: true },
>   password: { type: String, required: true, minlength: 6 },
>   role: { type: String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER' },
>   country: { type: String, enum: ['INDIA', 'AMERICA'], required: true },
> });
> ```
> `enum` prevents invalid role values. `unique: true` prevents duplicate emails. `required: true` ensures essential fields exist. Validation fires before any `save()` call.

---

**Q21. What is the difference between `find()` and `findOne()` in Mongoose?**

> **Answer:**
> - `find()` returns an **array** of all matching documents (empty array if none found).
> - `findOne()` returns the **first matching document** or `null` if not found.
>
> Use `findOne({ email })` for login lookups, `find({ country })` for listing restaurants by country.

---

**Q22. What MongoDB indexes would you add for production?**

> **Answer:**
> ```js
> userSchema.index({ email: 1 }, { unique: true });
> restaurantSchema.index({ country: 1 });         // ABAC filter queries
> orderSchema.index({ userId: 1, status: 1 });    // User order lookups
> orderSchema.index({ country: 1, status: 1 });   // Manager queries
> ```
> Without indexes, MongoDB performs full collection scans (`COLLSCAN`) — O(n). With indexes, lookups are O(log n) B-tree traversal. Critical for scale.

---

**Q23. Explain the difference between embedding and referencing in MongoDB.**

> **Answer:**
> - **Embedding**: Store related data inside the same document. Best for data always fetched together.
> - **Referencing**: Store an ObjectId and use `populate()`. Best for large related data shared across documents.
>
> Our `Order` references `Restaurant` by ID: `restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' }`. We use `Order.find().populate('restaurant')` to join data.

---

**Q24. What is `populate()` and when can it cause N+1 query problems?**

> **Answer:**
> `populate()` replaces ObjectId references with actual documents. **N+1 Problem**: if you call `populate()` inside a loop per order, it fires one DB query per order. Mongoose's `populate()` on an array is optimized — it batches into just 2 queries total (1 for orders, 1 for all referenced restaurants).

---

**Q25. How would you handle database transactions in MongoDB?**

> **Answer:**
> ```js
> const session = await mongoose.startSession();
> session.startTransaction();
> try {
>   await Order.create([orderData], { session });
>   await Cart.deleteOne({ userId }, { session });
>   await session.commitTransaction();
> } catch (err) {
>   await session.abortTransaction();
>   throw err;
> } finally { session.endSession(); }
> ```
> Used when creating an order and clearing the cart must succeed or fail **atomically** (ACID guarantee).

---

**Q26. How would you implement soft delete instead of hard delete?**

> **Answer:**
> Add a `deletedAt` timestamp field instead of removing documents:
> ```js
> // Schema
> deletedAt: { type: Date, default: null }
> // Soft delete
> await User.findByIdAndUpdate(id, { deletedAt: new Date() });
> // Automatically exclude soft-deleted
> userSchema.pre('find', function() { this.where({ deletedAt: null }); });
> ```
> Benefits: data recovery, audit trail preservation, referential integrity for orders that reference users.

---

### ⚛️ CATEGORY E — React & TanStack React Query

---

**Q27. What is TanStack React Query and why use it instead of useState + useEffect?**

> **Answer:**
> React Query is a **server-state management library**. Without it:
> ```js
> const [data, setData] = useState(null);
> useEffect(() => { fetchData().then(setData); }, []);
> ```
> This misses: caching, background refetching, stale data handling, deduplication, and retry logic. React Query handles all of these automatically. It also syncs server state across components via a shared `queryClient` cache.

---

**Q28. Explain `useQuery` vs `useMutation` in your project.**

> **Answer:**
> - **`useQuery`**: For **reading data** (GET requests). Automatically fetches, caches, and re-fetches when stale.
>   - `queryKey: ['users']` — cache key. Same key = shared cache across components.
>
> - **`useMutation`**: For **writing data** (POST, PUT, DELETE). Does not auto-run.
>   - `onSuccess: () => queryClient.invalidateQueries(['users'])` — invalidates cache after write so UI re-fetches fresh data.

---

**Q29. What is React Query's cache invalidation and why does it matter?**

> **Answer:**
> After deleting a user, `onSuccess` calls `queryClient.invalidateQueries(['users'])`. This marks the `users` cache as **stale**, triggering an automatic background re-fetch. Without this, the UI would still show the deleted user from cache. Invalidation is what keeps UI synchronized with server state after mutations.

---

**Q30. What is the `queryKey` array and what does it represent?**

> **Answer:**
> `queryKey` uniquely identifies a query in the cache:
> ```js
> queryKey: ['menuItems', selectedRestaurant?._id]
> ```
> When `selectedRestaurant._id` changes, React Query treats it as a **different query**, automatically fetching for the new restaurant. This implements dependent/parameterized queries without manual `useEffect` cleanup.

---

**Q31. What is the `enabled` option in `useQuery`?**

> **Answer:**
> `enabled: !!selectedRestaurant` conditionally runs the query. When `selectedRestaurant` is `null`, the query does not fire. This prevents unnecessary API calls when no restaurant has been selected.

---

**Q32. How did you solve the `JSON.parse("undefined")` crash in ProtectedRoute?**

> **Answer:**
> `localStorage.getItem('user')` can return the string `"undefined"` if stored as `localStorage.setItem('user', undefined)`. `JSON.parse("undefined")` throws `SyntaxError`, crashing the React tree. We solved this with:
> ```js
> const safeParseUser = () => {
>   try {
>     const str = localStorage.getItem('user');
>     if (!str || str === 'undefined') return null;
>     return JSON.parse(str);
>   } catch { return null; }
> };
> ```

---

**Q33. What is the purpose of `ProtectedRoute` and how does it work?**

> **Answer:**
> `ProtectedRoute` wraps route components to enforce authentication and role authorization:
> ```jsx
> const ProtectedRoute = ({ allowedRoles, children }) => {
>   const user = safeParseUser();
>   if (!user) return <Navigate to="/" />;
>   if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
>   return children;
> };
> ```
> Redirects unauthenticated users to login and redirects users lacking required roles back to `/`.

---

**Q34. What is `useQueryClient` used for?**

> **Answer:**
> `useQueryClient()` returns the shared `QueryClient` cache instance. Used in mutation `onSuccess` callbacks to call `queryClient.invalidateQueries(['users'])`, marking cache entries stale and triggering re-fetches to keep UI synchronized with the database after writes.

---

### 🎨 CATEGORY F — Theme Engine & CSS Architecture

---

**Q35. How does the dual Light/Dark theme engine work without re-renders?**

> **Answer:**
> We use **CSS Custom Properties** scoped to `:root` (dark default) and `html.light` (light override):
> ```css
> :root { --bg-main: #09090b; --text-main: #f4f4f5; }
> html.light { --bg-main: #f8fafc; --text-main: #0f172a; }
> ```
> Toggling `document.documentElement.classList.toggle('light')` instantly updates all variables in one browser paint cycle — no React state change, no re-render cascade. Components use `bg-[var(--bg-main)]` arbitrary Tailwind values.

---

**Q36. Why did you encounter black backgrounds in light mode and how did you fix it?**

> **Answer:**
> Components had **hardcoded TailwindCSS classes** like `bg-zinc-950` that resolve to absolute dark colors regardless of theme. The fix was a systematic refactor replacing every hardcoded class with semantic CSS variable equivalents:
> - `bg-zinc-950` → `bg-[var(--bg-main)]`
> - `bg-zinc-900` → `bg-[var(--bg-panel)]` or `bg-[var(--bg-card)]`
> - `text-zinc-100` → `text-[var(--text-main)]`
> - `border-zinc-800` → `border-[var(--border-subtle)]`

---

**Q37. How is theme preference persisted across browser sessions?**

> **Answer:**
> ```js
> const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
> const toggleTheme = () => {
>   const next = theme === 'dark' ? 'light' : 'dark';
>   setTheme(next);
>   localStorage.setItem('theme', next);
>   document.documentElement.classList.toggle('light', next === 'light');
> };
> ```
> On app mount, `localStorage` is read to restore previous theme. True persistence without cookies or backend calls.

---

### 🌐 CATEGORY G — System Design & Production Readiness

---

**Q38. How would you scale this application to handle 100K concurrent users?**

> **Answer:**
> Multi-layer scaling:
> 1. **Horizontal Scaling**: Multiple Node.js instances behind Nginx/AWS ALB. JWT is stateless — no session store needed.
> 2. **Caching**: Redis to cache restaurant lists, menu items. Cache-aside pattern with TTL.
> 3. **Database**: MongoDB Atlas clusters with read replicas. Route reads to replicas.
> 4. **CDN**: Serve React SPA from CloudFront/Vercel CDN — zero compute for static assets.
> 5. **Rate Limiting**: `express-rate-limit` with Redis store to prevent DDoS.
> 6. **Message Queue**: RabbitMQ/SQS to decouple order placement from processing.

---

**Q39. What security vulnerabilities does this project protect against?**

> **Answer:**
> | Attack | Defense |
> |---|---|
> | XSS | HTTP-Only cookies (token unreadable by JS) |
> | CSRF | `SameSite=Strict` cookie attribute |
> | NoSQL Injection | Mongoose schema validation + typed ObjectId params |
> | Brute Force | Rate limiting + bcrypt cost factor |
> | Privilege Escalation | JWT role signed + server re-verified every request |
> | IDOR | Country-scoped ABAC filters prevent cross-user data access |
> | Info Leakage | Error messages sanitized, stack traces not sent to client |

---

**Q40. How would you add real audit logging to the backend?**

> **Answer:**
> ```js
> const auditLog = async (req, res, next) => {
>   const originalSend = res.json.bind(res);
>   res.json = (body) => {
>     AuditLog.create({
>       userId: req.user?.userId,
>       role: req.user?.role,
>       action: `${req.method} ${req.path}`,
>       status: res.statusCode < 300 ? 'ALLOWED' : 'BLOCKED',
>       ip: req.ip,
>       timestamp: new Date(),
>     }).catch(console.error);
>     return originalSend(body);
>   };
>   next();
> };
> ```

---

**Q41. How would you implement rate limiting on auth endpoints?**

> **Answer:**
> ```js
> import rateLimit from 'express-rate-limit';
> const authLimiter = rateLimit({
>   windowMs: 15 * 60 * 1000,  // 15 minutes
>   max: 10,                    // 10 attempts per window
>   message: { error: 'Too many login attempts. Try again in 15 minutes.' },
>   standardHeaders: true,
> });
> router.post('/login', authLimiter, loginController);
> ```
> For distributed environments, use `rate-limit-redis` to share counters across instances.

---

**Q42. How would you implement 2FA (Two-Factor Authentication)?**

> **Answer:**
> 1. User enables 2FA → generate TOTP secret with `otplib`, display QR code for Google Authenticator.
> 2. Store encrypted `twoFactorSecret` in User document.
> 3. On login: if `user.twoFactorEnabled === true`, return `{ requiresOtp: true, tempToken }`.
> 4. Frontend prompts for OTP code.
> 5. User submits OTP → `POST /api/auth/verify-otp` → `totp.verify({ token, secret })`.
> 6. If valid → issue full access JWT.

---

### 🔧 CATEGORY H — Architecture & Behavioral Discussion

---

**Q43. Why did you choose React Query over Redux for state management?**

> **Answer:**
> Redux is designed for **client-side application state**. Fetched server data (users, orders, restaurants) is **server state** — it lives on the server and changes independently. Mixing server state into Redux requires manual cache invalidation, loading states, and retry logic — all solved by React Query out-of-the-box. React Query separates server state from client state, which is the architecture recommended by the React team.

---

**Q44. Walk me through a complete order placement flow from click to database.**

> **Answer:**
> 1. User clicks "Checkout" in `ManagerDashboard`
> 2. `handleCheckout()` calls `createOrderMutation.mutate(orderData)`
> 3. React Query fires `POST /api/orders/create`
> 4. Browser attaches HTTP-Only JWT cookie automatically
> 5. `protect` middleware verifies JWT → sets `req.user = { userId, role: 'MANAGER', country: 'INDIA' }`
> 6. `checkPermission('create_order')` → MANAGER is in allowlist → `next()`
> 7. Controller creates `Order` document in MongoDB with `status: 'PENDING'`
> 8. Returns `201` with created order
> 9. `onSuccess`: `queryClient.invalidateQueries(['orders'])`
> 10. React Query re-fetches orders → UI shows new order in Orders tab

---

**Q45. What was the biggest technical challenge in this project?**

> **Answer:**
> The most nuanced challenge was the **dual-layer theme engine**. Components had hardcoded Tailwind zinc colors that broke completely in light mode. The solution required:
> 1. Designing a **CSS custom properties token system** (6 semantic variables for both themes)
> 2. Systematically refactoring 7 components (100+ class replacements)
> 3. Ensuring `html.light` selector specificity overrides `:root` defaults correctly
> 4. The `localStorage` persistence + `classList.toggle` pattern for zero-flicker switching

---

**Q46. How would you add pagination to the users list?**

> **Answer:**
> **Backend**:
> ```js
> const { page = 1, limit = 20 } = req.query;
> const users = await User.find().skip((page - 1) * limit).limit(parseInt(limit)).lean();
> const total = await User.countDocuments();
> res.json({ users, total, pages: Math.ceil(total / limit) });
> ```
> **Frontend**:
> ```js
> const [page, setPage] = useState(1);
> const { data } = useQuery({
>   queryKey: ['users', page],
>   queryFn: () => getUsers(page),
>   keepPreviousData: true,  // Smooth pagination without loading flash
> });
> ```

---

**Q47. How would you write unit tests for the `checkPermission` middleware?**

> **Answer:**
> ```js
> describe('checkPermission', () => {
>   it('allows ADMIN to place_order', () => {
>     const req = { user: { role: 'ADMIN' } };
>     const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
>     const next = jest.fn();
>     checkPermission('place_order')(req, res, next);
>     expect(next).toHaveBeenCalled();
>   });
>
>   it('blocks MEMBER from place_order with 403', () => {
>     const req = { user: { role: 'MEMBER' } };
>     const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
>     const next = jest.fn();
>     checkPermission('place_order')(req, res, next);
>     expect(res.status).toHaveBeenCalledWith(403);
>   });
> });
> ```

---

**Q48. If a Senior Engineer reviewed this, what would they suggest improving?**

> **Answer:**
> Honest production gaps:
> 1. **Input validation**: Add `express-validator` or `Zod` for request body validation.
> 2. **Environment config**: `.env` file with `dotenv`, validated on startup.
> 3. **Logging**: Replace `console.log` with `winston` or `pino` for structured, leveled logging.
> 4. **API versioning**: Prefix with `/api/v1/`.
> 5. **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options).
> 6. **Integration tests**: Cypress/Playwright E2E for critical user flows.

---

**Q49. How does Vite differ from Create React App?**

> **Answer:**
> | Feature | Vite | Create React App |
> |---|---|---|
> | Dev Server | Native ESM (no bundling in dev) | Webpack bundler |
> | HMR Speed | Near-instant | Slow on large apps |
> | Build | Rollup (optimized) | Webpack |
> | Config | `vite.config.js` (simple) | Ejected webpack (complex) |
>
> Vite serves files directly as ESM to the browser during development without bundling, making HMR near-instantaneous.

---

**Q50. How would you add WebSocket real-time order status updates?**

> **Answer:**
> 1. Add `socket.io` to Express backend.
> 2. On status change, emit to room:
>    ```js
>    io.to(`user_${order.userId}`).emit('order_update', { orderId, status });
>    ```
> 3. Frontend connects on mount:
>    ```js
>    const socket = io('http://localhost:5000');
>    socket.on('order_update', ({ orderId, status }) => {
>      queryClient.setQueryData(['orders'], (old) =>
>        old.map(o => o._id === orderId ? { ...o, status } : o)
>      );
>    });
>    ```

---

**Q51. Explain the financial tax engine and how it demonstrates ABAC.**

> **Answer:**
> The tax engine is a practical ABAC demonstration:
> ```js
> const country = currentUser?.country || 'INDIA';
> const taxRate = country === 'INDIA' ? 0.18 : 0.08;  // 18% GST vs 8% US Sales Tax
> const taxAmount = subtotal * taxRate;
> const grandTotal = subtotal + taxAmount;
> ```
> The user's `country` attribute (stored in JWT, decoded from cookie) dynamically determines which tax rate applies — this is ABAC in action: the same `place_order` action produces different financial results based on user attributes.

---

**Q52. How would you implement API versioning for backward compatibility?**

> **Answer:**
> URL-based versioning is simplest and most visible:
> ```js
> // v1 routes
> app.use('/api/v1/auth', authRouterV1);
> app.use('/api/v1/orders', orderRouterV1);
>
> // v2 routes (new features, breaking changes)
> app.use('/api/v2/orders', orderRouterV2);
> ```
> Old clients continue hitting `/api/v1/` while new clients use `/api/v2/`. Alternatively, use **header-based versioning** (`Accept: application/vnd.api.v2+json`) for cleaner URLs.

---

## 📊 4. Business Logic Features Summary

| Feature | Implementation Detail |
|---|---|
| **Regional Tax Engine** | 18% GST (INDIA) vs 8% Sales Tax (AMERICA) applied to cart subtotal |
| **Dynamic Policy Sandbox** | Admin-controlled runtime permission toggles for role capabilities |
| **Order Lifecycle Stepper** | Visual pipeline: PENDING → PROCESSING → DELIVERED |
| **Persona Quick-Switcher** | Login page pre-fills credentials for all 3 role types |
| **RBAC Inspector Modal** | Visual permission matrix showing live role + allowed/denied actions |
| **ABAC Country Scope** | Database queries filtered by JWT country attribute for data isolation |
| **JWT Token Inspector** | Profile page shows decoded JWT fields and expiry |
| **Audit Log Stream** | Security event log with ALLOWED/BLOCKED filtering and CSV export |
| **2FA Toggle UI** | Profile page 2FA enable/disable with recovery code display |

---

## 🔑 5. Quick-Reference Cheat Sheet

```
Login Flow:    POST /auth/login → JWT in cookie → localStorage user object
Protect MW:   Extracts JWT → jwt.verify() → req.user = { userId, role, country }
RBAC MW:      checkPermission(action) → PERMISSIONS[action].includes(req.user.role)
ABAC Filter:  role === 'ADMIN' ? {} : { country: req.user.country }
Theme Switch: document.documentElement.classList.toggle('light') + localStorage
React Query:  useQuery (reads) + useMutation (writes) + queryClient.invalidateQueries
Safe Parse:   try/catch around JSON.parse(localStorage.getItem('user'))
GST Engine:   country === 'INDIA' ? 0.18 : 0.08 — ABAC attribute drives business logic
```

---

*Built with dedication for technical interview excellence — RBAC Sentinel v2.0*
