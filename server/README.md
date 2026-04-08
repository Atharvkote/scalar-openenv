# Restaurant QR Order System — Backend


## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js with Express.js 5.x |
| Database | MongoDB via Mongoose ODM |
| Cache / Pub-Sub | Redis |
| Real-time | Socket.IO |
| Machine Learning | TensorFlow.js |
| Logging | Winston |
| Job Queue | Bull |
| Payments | Razorpay |
| Validation | Zod |
| Security | Helmet, CORS, Redis-backed rate limiting |


## High-Level Architecture

Express.js orchestrates all HTTP and WebSocket traffic through a modular controller layer. MongoDB handles persistent storage, Redis handles rate limiting and caching, and Socket.IO delivers real-time updates to kitchen, admin, and client interfaces. A hybrid TensorFlow.js recommendation engine runs alongside the main request lifecycle.


## Request / Response Flow

```mermaid
flowchart TD
    A[Client Request] -->|HTTP / WebSocket| B[Express Server]
    B --> C[Middleware Layer]
    C -->|Auth, Rate Limit, CORS, Helmet| D[Route Handlers]

    D -->|/api/auth| E[Auth Controller]
    D -->|/api/order| F[Order Controller]
    D -->|/api/payment| G[Payment Controller]
    D -->|/api/service| H[Service Controller]
    D -->|/api/contact| I[Contact Controller]
    D -->|/api/recommendations| J[Recommendation Controller]
    D -->|/api/admin| K[Admin Controller]

    J --> L[Recommendation Engine - TensorFlow.js]
    L --> M[(MongoDB)]
    F --> M
    G --> M
    H --> M
    K --> M

    B --> N[Socket.IO]
    N --> O[Kitchen / Admin / Client Sockets]

    B --> P[Winston Logger]
    B --> Q[Error Middleware]
    B --> R[Static File Server]
    B --> S[(Redis)]
    B --> U[Mongoose Connection]
    U --> M
```


## Controller Responsibilities

```mermaid
flowchart TD
    subgraph Controllers
        A1[Auth]
        A2[Order]
        A3[Payment]
        A4[Service]
        A5[Contact]
        A6[Recommendation]
        A7[Admin]
        A8[Kitchen]
        A9[Developer]
    end

    A1 --> B1[JWT Generation]
    A1 --> B2[2FA / TOTP Verification]
    A2 --> B3[Order Model]
    A2 --> B4[Session and Table Model]
    A3 --> B5[Razorpay API]
    A3 --> B6[Payment Model]
    A4 --> B7[Service Model - Menu CRUD]
    A5 --> B8[Contact Model]
    A6 --> B9[Recommendation Engine]
    A6 --> B10[UserPreference Model]
    A7 --> B11[Admin / Session / Table Models]
    A7 --> B12[Analytics and Stats]
    A8 --> B13[Socket.IO Events]
    A9 --> B14[Developer Model]
```


## Authentication Flow

```mermaid
flowchart TD
    A[Client] --> B[Login / Register Request]
    B --> C[Auth Middleware]
    C -->|No token| D[401 Unauthorized]
    C -->|Token present| E[JWT Verification]
    E -->|Invalid or expired| D
    E -->|Valid| F[Role Extraction]
    F -->|User / Admin / Developer| G[Attach User to Request]
    G --> H[Controller Access Check]
    H -->|Authorized| I[Proceed to Controller]
    H -->|Insufficient role| J[403 Forbidden]
```


## TOTP Order Placement Flow

TOTP is used exclusively for order placement. When a user initiates an order, a time-based one-time password is generated and displayed to both the user and the admin. The order is only confirmed after the user submits the correct TOTP.

```mermaid
flowchart TD
    O1[User Initiates Order] --> O2[Generate TOTP]
    O2 --> O3[Display TOTP to Admin]
    O3 --> O4[User Enters TOTP]
    O4 --> O5[Verify TOTP]
    O5 -->|Valid| O6[Order Placed]
    O5 -->|Invalid| O7[401 Unauthorized - Retry]
```


## Order Session Lifecycle

```mermaid
flowchart TD
    O1[User Places Order] --> O2[Session Lookup or Create]
    O2 --> O3[Assign Table]
    O3 --> O4[Order Created]
    O4 --> O5[Order Sent to Kitchen]
    O5 --> O6[Kitchen Updates Status]
    O6 --> O7[Order Ready and Delivered]
    O7 --> O8[Billing Initiated]
    O8 --> O9[Payment Processed]
    O9 --> O10[Session Closed]
    O10 --> O11[Table Available]
```


## Database Models

| Model | Purpose |
|-------|---------|
| User, Admin, Developer | Authentication, roles, and preferences |
| Order | Order lifecycle and line items |
| Session | Groups orders for a table visit |
| Table | Physical table state |
| Service | Menu items, categories, and attributes |
| Recommendation | Item embeddings, co-occurrence data, model metadata |
| Payment | Payment status and Razorpay transaction records |
| Contact | Customer support submissions |
| PasswordToken | Password reset tokens |


## Recommendation Engine

The engine combines a TensorFlow.js neural network with co-occurrence statistics for a hybrid approach to menu recommendations.

- Trained on up to 6 months of order history
- Generates item embeddings updated on each training run
- Incorporates user preferences including dietary restrictions, price range, and past favorites
- Produces real-time suggestions as cart contents change
- Falls back to co-occurrence statistics when the neural model is unavailable
- Model metadata tracks version, training date, and status


## Security

- JWT authentication with role-based access for user, admin, and developer roles
- Redis-backed rate limiting applied globally and on sensitive endpoints
- Helmet for HTTP header hardening
- Strict CORS origin policy
- Centralized error middleware formats all errors consistently before returning to client
- Winston logs all errors, warnings, and info persistently to file and console


## Developer Reference

| Topic | Location |
|-------|----------|
| Entry point | `server.js` |
| Controllers | `controllers/` |
| Route definitions | `routes/` |
| Database models | `database/models/` |
| Recommendation engine | `utils/recommendation-engine.js` |
| Logger configuration | `utils/logger.js` |
| Environment config | `.env` |

Start the server with `npm run dev` (development) or `npm start` (production). New features should follow the existing pattern of adding a controller in `controllers/` and registering routes in `routes/`.