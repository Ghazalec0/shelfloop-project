# ShelfLoop — Your Library Universe

<div align="center">

[![ShelfLoop](https://img.shields.io/badge/ShelfLoop-Library%20System-FFB800?style=for-the-badge)](https://github.com/your-username/shelfloop)
![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=flat-square)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square)

**A Complete Digital Library — Borrowing, Purchases, Fines, Online Payments, and an AI Assistant**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation-and-setup) • [API](#-api-documentation) • [Payments](#-online-payments) • [AI Assistant](#-ai-assistant)

</div>

---

## 📖 About the Project

**ShelfLoop** is a full-stack library management system that allows users to browse books, borrow them, purchase permanent copies, pay overdue fines, and interact with an intelligent AI assistant.

The project aims to deliver a polished user experience through a modern interface, smooth animations, full Arabic and English language support, and real online payment integrations using **Paymob** and **Stripe**.

---

## ✨ Features

### 📚 Reader Features

| Feature | Description |
| :--- | :--- |
| **Browse Books** | A rich catalog with real book covers, title and author search, and category filtering. |
| **Borrow Books** | Borrow books for 14 days, with reminders before the return deadline. |
| **Purchase Books** | Buy a permanent copy, with the inventory updated accordingly. |
| **My Books** | View currently borrowed books and previous borrowing history. |
| **Fines** | Automatic fine calculation at EGP 5 per overdue day, with online payment support. |
| **AI Assistant** | Ask questions about any book or topic and receive answers in your preferred language. |

### 🛡️ Admin Features

| Feature | Description |
| :--- | :--- |
| **Dashboard** | Overview of total books, users, borrowed books, returned books, overdue books, and fines. |
| **Book Management** | Add, update, and delete books; upload covers; and manage available copies. |
| **Borrowing Management** | View all borrowing records and overdue items, and confirm book returns. |
| **Purchase and Fine Management** | Confirm cash payments and track pending payments. |
| **User Management** | View registered users and their roles. |

### 🔐 Security

- JWT-based authentication.
- Strong password requirements: at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.
- Password recovery through a real email-based OTP: 6 digits with a 5-minute expiration period.
- Password hashing using `bcrypt`.
- Strict input validation using `class-validator`.
- Route protection through `JwtAuthGuard` and `RolesGuard`.

---

## 🛠️ Tech Stack

### Backend — `shelfloop-api`

| Technology | Version / Purpose |
| :--- | :--- |
| **NestJS** | 10.x — Node.js framework |
| **Prisma** | 6.19.3 — ORM |
| **PostgreSQL** | Primary database |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Nodemailer** | Sending OTP emails through Gmail |
| **Stripe** | Card payments |
| **Paymob** | Wallet payments (Vodafone Cash) |
| **Groq** | AI engine |
| **class-validator** | Input validation |

### Frontend — `shelfloop-web`

| Technology | Version / Purpose |
| :--- | :--- |
| **Next.js** | 16.4.2 — with Turbopack |
| **React** | 19 |
| **Tailwind CSS** | Styling |
| **shadcn / Base UI** | UI components |
| **Zustand** | State management (authentication) |
| **Axios** | API requests |
| **Framer Motion** | Animations |
| **react-markdown + remark-gfm** | Rendering AI responses in Markdown |
| **Sonner** | Toast notifications |
| **Lucide** | Icons |

---

## 📁 Project Structure

```text
ShelfLoop/
├── shelfloop-api/                 # Backend - NestJS
│   ├── src/
│   │   ├── auth/                  # Authentication, JWT, OTP, password recovery
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   ├── books/
│   │   ├── borrowing/             # Borrowing + Paymob + Stripe
│   │   │   ├── borrowing.service.ts
│   │   │   └── borrowing.controller.ts
│   │   ├── purchases/              # Purchases + Paymob + Stripe
│   │   ├── fines/                  # Fines + Paymob + Stripe
│   │   ├── ai/                     # AI Advisor (Groq)
│   │   │   ├── ai.service.ts
│   │   │   └── ai.controller.ts
│   │   ├── mail/                   # MailService - Nodemailer
│   │   ├── prisma/
│   │   └── common/
│   │       ├── interceptors/
│   │       │   └── response.interceptor.ts
│   │       └── filters/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   └── covers/                 # Real book covers (available offline)
│   └── .env
│
├── shelfloop-web/                  # Frontend - Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── page.tsx            # Home page (Catalog + AI + Admin)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   └── AiMessage.tsx       # AI response renderer
│   │   ├── lib/
│   │   │   └── api.ts              # Axios instance
│   │   └── store/
│   │       └── auth.ts             # Zustand store
│   └── .env.local
│
└── README.md
```

---

## 🚀 Installation and Setup

### Prerequisites

- **Node.js** >= 20
- **PostgreSQL** >= 15
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shelfloop.git
cd shelfloop
```

### 2. Set Up the Database

```bash
# Create a database named shelfloop
psql -U postgres -c "CREATE DATABASE shelfloop;"
```

### 3. Run the Backend

```bash
cd shelfloop-api
npm install

# Create the .env file
cp .env.example .env

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run start:dev
```

> Backend URL: **http://localhost:3000**

### 4. Run the Frontend

```bash
cd shelfloop-web
npm install

# Create the .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

npm run dev -- --port 3001
```

> Frontend URL: **http://localhost:3001**

---

## ⚙️ Environment Variables

### Backend — `shelfloop-api/.env`

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/shelfloop"

# JWT
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3001

# Mail - OTP (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=dev.ghazaleco@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Paymob
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_CARD_INTEGRATION_ID=123456
PAYMOB_WALLET_INTEGRATION_ID=654321
PAYMOB_WALLET_PHONE=01010101010

# AI - Groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
```

### Frontend — `shelfloop-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔌 API Documentation

### Base URL

```text
http://localhost:3000
```

### Authentication

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | — |
| `POST` | `/auth/login` | Log in and receive a JWT | — |
| `POST` | `/auth/forgot-password` | Send an OTP to the user's email | — |
| `POST` | `/auth/verify-otp` | Verify the OTP | — |
| `POST` | `/auth/reset-password` | Reset the password using an OTP | — |

**Register Example:**

```json
{
  "name": "Islam Ghazal",
  "email": "islam@example.com",
  "password": "Strong123@"
}
```

**Forgot Password Flow:**

```json
// POST /auth/forgot-password
{ "email": "islam@example.com" }

// POST /auth/verify-otp
{ "email": "islam@example.com", "otp": "123456" }

// POST /auth/reset-password
{ "email": "islam@example.com", "otp": "123456", "newPassword": "NewStrong123@" }
```

### Books

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Retrieve all books | — |
| `GET` | `/books/:id` | Retrieve a single book | — |
| `POST` | `/books` | Add a book | Admin |
| `PATCH` | `/books/:id` | Update a book | Admin |
| `DELETE` | `/books/:id` | Delete a book | Admin |

### Borrowing

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/borrows/stats` | Retrieve dashboard statistics | Admin |
| `GET` | `/borrows/overdue` | Retrieve overdue books | Admin |
| `GET` | `/borrows/my` | Retrieve the current user's borrowed books | User |
| `GET` | `/borrows/my/history` | Retrieve the current user's borrowing history | User |
| `GET` | `/borrows` | Retrieve all borrowing records | Admin |
| `POST` | `/borrows/:bookId` | Borrow a book | User |
| `POST` | `/borrows/:bookId/return` | Return a book | User |

**Borrowing Example:**

```bash
POST /borrows/{bookId}
Body: { "method": "WALLET" } # CASH | CARD | WALLET
Response: { "url": "https://accept.paymob.com/...", "borrowing": {...} }
```

### Purchases

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/purchases/:bookId` | Purchase a book | User |
| `GET` | `/purchases/my` | Retrieve the current user's purchases | User |
| `GET` | `/purchases` | Retrieve all purchases | Admin |

### Fines

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/fines/my` | Retrieve the current user's fines | User |
| `POST` | `/fines/:fineId/pay` | Pay a fine | User |
| `GET` | `/fines` | Retrieve all fines | Admin |

### AI Advisor

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/chat` | Chat with the AI assistant | User |

```json
// Request
{ "message": "Recommend a book about psychology." }

// Response
{ "reply": "I recommend ..." }
```

### Standard API Response Format (Response Interceptor)

All successful responses use the same structure:

```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": { "total": 100, "page": 1, "lastPage": 10 },
  "timestamp": "2026-11-08T20:00:00.000Z"
}
```

---

## 💳 Online Payments

### Paymob — Wallet Payments (Vodafone Cash)

The wallet payment flow:

```text
1. POST /api/auth/tokens → auth_token
2. POST /api/ecommerce/orders → order_id
3. POST /api/acceptance/payment_keys → payment_token
4. POST /api/acceptance/payments/pay → redirect_url
5. Redirect the user to redirect_url
```

> **Important:** Do not use `standalone/?payment_token=` for wallet payments. That flow is for card payments only and may result in a blank screen. For wallet payments, return the `redirect_url` from `/payments/pay`.

**Test Credentials:**

- Wallet phone number: `01010101010`
- MPIN: `123456`
- OTP: `123456`

### Stripe — Card Payments

A `checkout session` is created, and the user is redirected to `session.url`.

### Pricing

| Service | Price |
| :--- | :--- |
| **Borrowing** | EGP 45 / 14 days |
| **Late Fine** | EGP 5 / overdue day |
| **Purchase** | The book's listed price (defaults to EGP 150 if no price is available) |

---

## 🤖 AI Assistant

The assistant is powered by **Groq** using the `openai/gpt-oss-120b` model.

### Features

- Answers **general questions**, not just questions about books.
- Responds in **the user's language** (Arabic, English, or any other language).
- Supports full **Markdown** formatting, including headings, lists, code blocks, and tables.
- Automatically detects text direction through `dir="auto"` — right-to-left for Arabic and left-to-right for English.
- Does not rely on predefined replies; each response is generated dynamically.

### Configuration

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
```

---

## 🖼️ Offline Book Covers

Real book cover images are stored in:

```text
shelfloop-api/public/covers/
```

They are served from:

```text
http://localhost:3000/public/covers/01_Clean_Code.jpg
```

**Configuration in `main.ts`:**

```typescript
app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });
```

This allows the website to serve book covers without requiring an internet connection.

### Available Categories

`Business` • `Psychology` • `Science` • `Fiction` • `Self-Development` • `History` • `Novels` • `Horror` • `War` • `Programming`

---

## 🧪 Testing

### Postman

Use the following workflow with your Postman collection:

1. Send `POST /auth/register` and copy the `access_token`.
2. In Postman, go to `Authorization > Bearer Token` and paste the token.
3. Test `POST /borrows/{bookId}`.

### Fixing `Unauthorized` Errors

If you receive a `401 Unauthorized` response:

1. Make sure `JWT_SECRET` is identical in `AuthModule` and `JwtStrategy`.
2. Make sure the token is sent in the `Authorization` header as `Bearer <token>`.
3. Clear the old browser `localStorage`:

```js
localStorage.clear()
```

4. Log in again.

---

## 🐛 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `Prisma EPERM` during `generate` | Stop the server, delete `node_modules/.prisma`, then run `npx prisma generate`. |
| `Unauthorized` when borrowing | Verify the token and `JWT_SECRET`. |
| `Foreign key violated` | `userId` must be a valid UUID that exists in the database. |
| Blank screen during Paymob payment | Make sure the wallet flow returns `redirect_url`, not `standalone`. |
| `OTP not received` | Verify `MAIL_USER` and `MAIL_PASS` (use a Gmail App Password). |

---

## 👨‍💻 Developer

**Islam Ghazal**

- Email: dev.ghazaleco@gmail.com
- Project: ShelfLoop

---

## 📝 License

This project is intended for educational and personal use.

---

<div align="center">

**Made with ❤️ by the ShelfLoop Team**

⭐ If you like this project, please consider giving it a star on GitHub.

</div>
