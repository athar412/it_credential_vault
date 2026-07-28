# IT Credential Manager - Project Context for AI Agents

## Overview
This project is an **IT Credential Manager**, a secure web application designed to store and manage credentials for different platforms across various divisions. It features role-based access control, symmetric encryption for stored passwords, and audit logging.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS v4
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs` for hashing passwords and PINs.
- **Icons**: `lucide-react`
- **Language**: TypeScript

## Database Schema (Prisma)
The database (`prisma/dev.db`) consists of three main models:

1. **User**
   - `id`, `username`, `passwordHash`, `pinHash`
   - `role`: Can be `"SUPER_ADMIN"` or `"ADMIN_DIVISI"`.
   - `division`: The division the user belongs to (null for `SUPER_ADMIN`).

2. **Credential**
   - `id`, `platform`, `account`, `division`, `role`
   - `encryptedPassword`, `iv`, `authTag`: Passwords are encrypted before being stored in the database.

3. **AuditLog**
   - Tracks actions performed in the system, storing `action`, `username`, `targetId`, and `details`.

## Project Structure
- `src/app/`: Next.js App Router containing pages and API routes.
  - `src/app/login/`: Authentication page.
  - `src/app/dashboard/`: Main dashboard for viewing/managing credentials.
  - `src/app/api/`: Backend API endpoints.
- `src/middleware.ts`: Route protection. Unauthenticated users are redirected to `/login`, and authenticated users at `/` are redirected to `/dashboard`.
- `src/components/`: Reusable UI components.
- `src/lib/`: Utility functions (likely containing encryption/decryption logic, DB client, and auth helpers).
- `prisma/`: Contains `schema.prisma`, the local SQLite database (`dev.db`), and a seeding script (`seed.ts`).

## Key Features & Security
- **Authentication & Middleware**: JWT is stored in cookies (`auth_token`), validated by `middleware.ts` to protect all routes except `/login` and `/api/auth/*`.
- **Double Authentication (PIN)**: Users have both a `passwordHash` (for login) and a `pinHash` (likely required before revealing or modifying sensitive credentials).
- **Encrypted Storage**: The `Credential` model stores an `encryptedPassword` alongside an Initialization Vector (`iv`) and Authentication Tag (`authTag`), implying AES-GCM (or similar) symmetric encryption is used for password storage.
- **Role-Based Access Control (RBAC)**: Distinguishes between `SUPER_ADMIN` (global access) and `ADMIN_DIVISI` (division-scoped access).

## AI Agent Guidelines
- When making changes to the database, always update `prisma/schema.prisma` and run the necessary Prisma migrations.
- Respect the Next.js App Router conventions (server components by default, use `"use client"` when hooks are needed).
- Ensure that any new credential endpoints or logic respect the encryption/decryption utilities and role-based checks.
- Log sensitive actions (creating/updating credentials) to the `AuditLog` table.
