# Care.xyz Backend

REST API for **Care.xyz**, a babysitting, elderly care, and sick-person care booking platform. Built with Express.js, TypeScript, and MongoDB Atlas.

**Live API:** https://care-xyz-backend-psi.vercel.app

---

## Features

- Email and password registration and login
- Google sign-in (ID token verification on the server)
- JWT-based authentication
- Service catalog (Baby Care, Elderly Care, Sick People Care)
- Division → District → City → Area location tree
- Booking creation with automatic cost calculation (duration × daily rate)
- Booking status tracking: `pending`, `confirmed`, `completed`, `cancelled`
- Cancel pending bookings
- Invoice email sent after each booking (Nodemailer)
- Testimonials for the homepage

---

## Tech Stack

| Area             | Technology                                                     |
| ---------------- | -------------------------------------------------------------- |
| Runtime          | Node.js                                                        |
| Framework        | Express.js 5                                                   |
| Language         | TypeScript                                                     |
| Database         | MongoDB Atlas (native driver, no ODM)                          |
| Authentication   | JWT (`jsonwebtoken`), Google ID tokens (`google-auth-library`) |
| Password hashing | bcryptjs                                                       |
| Validation       | Zod                                                            |
| Email            | Nodemailer (Gmail SMTP)                                        |
| Deployment       | Vercel (serverless functions)                                  |

---

## Project Structure

```
care-xyz-backend/
├── api/
│   └── index.ts              # Vercel serverless entry point
├── src/
│   ├── app.ts                # Express app (routes, middleware)
│   ├── server.ts             # Local dev server (calls listen)
│   ├── config/
│   │   └── database.ts       # Cached MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── bookings.controller.ts
│   │   ├── locations.controller.ts
│   │   ├── services.controller.ts
│   │   └── testimonials.controller.ts
│   ├── middleware/
│   │   └── auth.ts           # JWT verification
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── bookings.routes.ts
│   │   ├── locations.routes.ts
│   │   ├── services.routes.ts
│   │   └── testimonials.routes.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── email.ts          # Invoice email
│       ├── google.ts         # Google ID token verification
│       ├── jwt.ts            # Token generation and verification
│       ├── response.ts       # Standard success/error responses
│       └── validators.ts     # Zod schemas
├── .env                      # Local environment variables (not committed)
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB Atlas cluster
- A Gmail account with an app password (for invoice emails)
- A Google OAuth client ID (for Google sign-in)

### Installation

```bash
git clone https://github.com/amirsayeed/Care-XYZ-Backend.git
cd care-xyz-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```dotenv
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/care-xyz?retryWrites=true&w=majority

JWT_SECRET=<random-64-character-hex-string>
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-gmail-address>
SMTP_PASS=<gmail-app-password>
SENDER_EMAIL=<your-gmail-address>
SENDER_NAME=Care.xyz
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable                      | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `PORT`                        | Local server port. Not used on Vercel.              |
| `MONGODB_URI`                 | MongoDB Atlas connection string                     |
| `JWT_SECRET`                  | Secret used to sign access tokens. Keep it private. |
| `JWT_EXPIRE`                  | Token lifetime, such as `7d`                        |
| `GOOGLE_CLIENT_ID`            | Must match the client ID used by the frontend       |
| `SMTP_*`                      | Gmail SMTP credentials for sending invoice emails   |
| `SENDER_EMAIL`, `SENDER_NAME` | Sender details shown in invoice emails              |

> **Never commit `.env`.** It contains database and email credentials. `.gitignore` must list `.env`.

### Running Locally

```bash
npm run dev
```

The server starts on `http://localhost:5000` and connects to MongoDB before listening.

### Seeding the Database

The services, locations, and testimonials are reference data. Seed them with the seed script from the frontend setup, or insert them directly in MongoDB Atlas.

---

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the local development server   |
| `npm run build` | Compile TypeScript to `dist/`        |
| `npm start`     | Run the compiled server from `dist/` |

---

## API Reference

Base URL (local): `http://localhost:5000`
Base URL (production): `https://care-xyz-backend-psi.vercel.app`

All responses use this envelope:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Errors use the same shape with `"success": false` and an `error` field.

### Health

| Method | Endpoint  | Auth | Description   |
| ------ | --------- | ---- | ------------- |
| GET    | `/health` | No   | Server status |

### Authentication

| Method | Endpoint             | Auth | Description                               |
| ------ | -------------------- | ---- | ----------------------------------------- |
| POST   | `/api/auth/register` | No   | Create an account with email and password |
| POST   | `/api/auth/login`    | No   | Sign in with email and password           |
| POST   | `/api/auth/google`   | No   | Sign in with a Google ID token            |
| GET    | `/api/auth/me`       | Yes  | Get the signed-in user's profile          |

**Register** `POST /api/auth/register`

```json
{
  "name": "Test Person",
  "email": "test@example.com",
  "contact": "01700000000",
  "nid": "1234567890123",
  "password": "Password123"
}
```

Password rules: at least 6 characters, with at least one uppercase and one lowercase letter.

**Login** `POST /api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

Both register and login return:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "contact": "..." },
    "token": "eyJhbGciOi..."
  }
}
```

**Google sign-in** `POST /api/auth/google`

```json
{
  "idToken": "<Google ID token from the OAuth flow>"
}
```

The server verifies the token with Google, creates the account if it doesn't exist, or links the Google ID to an existing account with the same email.

**Current user** `GET /api/auth/me`

Send the token in the header:

```
Authorization: Bearer <token>
```

### Services

| Method | Endpoint            | Auth | Description           |
| ------ | ------------------- | ---- | --------------------- |
| GET    | `/api/services`     | No   | List all services     |
| GET    | `/api/services/:id` | No   | Get one service by ID |

### Locations

| Method | Endpoint                             | Auth | Description                                 |
| ------ | ------------------------------------ | ---- | ------------------------------------------- |
| GET    | `/api/locations`                     | No   | Full division → district → city → area tree |
| GET    | `/api/locations/:division/districts` | No   | Districts within one division               |

### Bookings

All booking routes require authentication. Users can only see and change their own bookings.

| Method | Endpoint                   | Auth | Description              |
| ------ | -------------------------- | ---- | ------------------------ |
| POST   | `/api/bookings`            | Yes  | Create a booking         |
| GET    | `/api/bookings`            | Yes  | List the user's bookings |
| GET    | `/api/bookings/:id`        | Yes  | Get one booking          |
| PATCH  | `/api/bookings/:id/cancel` | Yes  | Cancel a pending booking |

**Create booking** `POST /api/bookings`

```json
{
  "serviceId": "67193a1c2f3e4b5c6d7e8f90",
  "duration": 3,
  "division": "Dhaka",
  "district": "Dhaka",
  "city": "Dhaka",
  "area": "Uttara",
  "address": "123 Main Street"
}
```

The server looks up the service rate and calculates `totalCost = duration × hourlyRate`. The client never sets the price. After saving, it sends an invoice email to the user's address.

### Testimonials

| Method | Endpoint            | Auth | Description                   |
| ------ | ------------------- | ---- | ----------------------------- |
| GET    | `/api/testimonials` | No   | Latest testimonials (up to 6) |

### Error Codes

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Invalid input, or a malformed ID                         |
| 401    | Missing, invalid, or expired token, or wrong credentials |
| 404    | Resource not found, or not owned by the user             |
| 500    | Unexpected server error                                  |

---

## Database Collections

| Collection     | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| `users`        | Accounts (password hash for email login, `googleId` for Google login) |
| `services`     | The three care services with daily rates                              |
| `bookings`     | User bookings with status, cost, and location                         |
| `locations`    | Single document holding the division tree                             |
| `testimonials` | Homepage reviews                                                      |

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. Leave the build and output settings at their defaults.
3. Add every variable from `.env` in **Settings → Environment Variables**, except `PORT`.
4. Deploy.

`vercel.json` rewrites all requests to `api/index.ts`, which exports the Express app as a serverless function. The database connection is cached between requests, so warm invocations reuse it.

**MongoDB Atlas:** under **Network Access**, allow `0.0.0.0/0`. Vercel's outgoing IPs change, so a fixed allowlist won't work.

---

## Security Notes

- Passwords are hashed with bcryptjs before storage. Plain-text passwords are never saved.
- Tokens are signed with `JWT_SECRET`. Rotate the secret if it's exposed.
- Google tokens are verified against Google's signing keys and the configured client ID.
- Booking prices are calculated on the server, so clients can't set their own price.
- Each booking query filters by the signed-in user's ID.
- Rotate any credential that was shared outside your environment, including database passwords, Gmail app passwords, and OAuth secrets.

---

## Known Limitations

- Invoice emails are sent during the booking request. If Gmail is slow, the request waits for it.
- Booking status is changed by the user only through cancellation. Confirmation and completion need an admin dashboard.
- The `/api/auth/me` response includes the user's contact details only. The NID is never returned.

---
