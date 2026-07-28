# IT Credential Vault

IT Credential Vault is a secure web application built to manage internal and third-party credentials for teams and organizations. It provides strict access control, encrypted password storage, and an additional layer of PIN security for sensitive mutations.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Authentication**: JWT via `jose`
- **Security**: `bcrypt` for hashing, Node `crypto` (`aes-256-gcm`) for two-way payload encryption
- **Icons**: `lucide-react`

## Features & Architecture

### 1. Role-Based Access Control (RBAC)
There are two main access tiers:
- **`SUPER_ADMIN`**: Has unrestricted access to all credentials. Can access the **User Management** page to perform CRUD operations on all users and define their roles/divisions.
- **`ADMIN_DIVISI`**: Has access restricted only to the credentials belonging to their specific division. Cannot access the User Management page.

### 2. Action Security PIN
All non-read actions (Create, Update, Delete) for both Users and Credentials are protected by a **6-digit Security PIN**. 
- Even if a user's session token is hijacked, attackers cannot modify or delete vault entries without the user's PIN.
- PIN prompts are managed on the Client Side via `PinModal.tsx` and strictly verified on the Server Side API routes using `bcrypt.compare`.

### 3. Encrypted Payloads
Passwords stored in the Credentials table are not just hashed—they are symmetrically encrypted using `aes-256-gcm` (via `src/lib/crypto.ts`) so they can be decrypted and revealed to authorized users upon request.

### 4. Dynamic Filtering
The frontend lists (Users and Credentials) feature dropdown filters that automatically populate their options based on the unique data rendered in the tables, allowing for seamless and accurate navigation.

## Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the root directory based on `.env.example` or with the following variables:
   ```env
   # Database connection string (SQLite)
   DATABASE_URL="file:./dev.db"

   # Secret key for JWT and encryption (must be exactly 32 chars for AES-256-GCM)
   JWT_SECRET="your-32-character-ultra-secure-key"
   ENCRYPTION_KEY="your-32-character-ultra-secure-key"
   ```

3. **Initialize the Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Maintenance Notes
- **Prisma Schema**: Whenever you modify `prisma/schema.prisma`, remember to run `npx prisma db push` and `npx prisma generate` to sync your database and TypeScript types.
- **Linting & Building**: The CI/CD pipeline enforces `npm run lint` and `npm run build`. If you encounter state synchronization errors in React Hooks, ensure they are properly handled or disabled explicitly if it is safe to do so.
