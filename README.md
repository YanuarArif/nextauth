# Secure Authentication System

A robust authentication system built with Next.js, Prisma, and Neon PostgreSQL, featuring email verification, password reset, and rate limiting.

## Features

- 🔐 Secure user authentication
- ✉️ Email verification
- 🔑 Password reset functionality
- 🛡️ Rate limiting protection
- 🔒 Secure password hashing with bcrypt
- 🎫 JWT-based session management
- 📝 Input validation using Zod
- 🚦 Rate limiting for security
- 🗃️ PostgreSQL database with Prisma ORM

## Setup

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- Get a PostgreSQL database URL from [Neon](https://neon.tech)
- Get an API key from [Resend](https://resend.com) for email services
- Generate a secure JWT secret
- Set your application URL

3. Initialize the database:

```bash
bunx prisma db push
```

## API Endpoints

### POST /api/auth/register

Register a new user

```typescript
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### POST /api/auth/login

Login with credentials

```typescript
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST /api/auth/verify

Verify email address

```typescript
{
  "token": "verification-token"
}
```

### POST /api/auth/forgot-password

Request password reset

```typescript
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password

Reset password with token

```typescript
{
  "token": "reset-token",
  "password": "newpassword"
}
```

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **Rate Limiting**: Prevents brute force attacks
- **JWT Tokens**: Secure session management
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Input Validation**: Prevents injection attacks
- **Security Headers**: Protection against common web vulnerabilities
- **Email Verification**: Prevents fake email registrations

## Rate Limits

- Login: 5 attempts per minute
- Register: 3 attempts per hour
- Forgot Password: 3 attempts per hour
- Reset Password: 3 attempts per hour
- Email Verification: 5 attempts per 5 minutes

## Environment Variables

```plaintext
DATABASE_URL=           # Neon PostgreSQL connection URL
JWT_SECRET=            # Secret key for JWT signing
RESEND_API_KEY=        # Resend API key for emails
NEXT_PUBLIC_APP_URL=   # Your application URL
NODE_ENV=              # development/production
```

## Database Schema

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  name              String?
  emailVerified     DateTime?
  verificationToken String?   @unique
  resetToken        String?   @unique
  resetTokenExpires DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```
