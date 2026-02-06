This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# 🌍 Secure Auth V2 - Earthy Modern Dashboard

A production-ready Next.js authentication system with role-based access control (RBAC), built with Prisma 7, Auth.js v5, and an earthy modern design theme.

## ✨ Features

### Authentication & Security
- **Unified Login System**: Supports both Email/Password and Google OAuth
- **Auth.js v5 (NextAuth)**: Industry-standard authentication with JWT strategy
- **Account Hijacking Prevention**: Strict email verification before account linking
- **Session Management**: 30-day secure sessions with automatic refresh
- **Active User Validation**: Real-time account status checks

### Role-Based Access Control (RBAC)
Three-tier permission system:
- **SUPER_ADMIN**: Full system control, user management, role assignment
- **ADMIN**: Post moderation, content approval workflows
- **USER**: Post creation, personal dashboard access

### Core Functionality
- **Public Post Wall**: Visible to all visitors, showcasing approved content
- **Post Editor Modal**: Authenticated users can submit posts for review
- **Admin Moderation**: High-fidelity approval/rejection interface with status badges
- **User Management Table**: Toggle active status, change roles, view audit data
- **Personal Dashboard**: User stats, recent posts, quick actions

### Design System
**Earthy Modern Theme**:
- Primary: Burnt Orange (#CC5500)
- Secondary: Forest Green (#2D5A27)
- Accent: Earth Brown (#4B3621)
- Surface: Stone Grey (#F5F5F4)
- Background: Ivory White (#FCFAF7)

**UI Features**:
- 12px border-radius for consistent rounded corners
- Glassmorphism effects on sidebar and overlays
- High-contrast text for accessibility
- Responsive layouts with Tailwind CSS v4
- Custom component library (no Shadcn dependency)

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Database ORM | Prisma 7.x (Driver-Adapter Architecture) |
| Auth | Auth.js v5 (NextAuth) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | PostgreSQL with @prisma/adapter-pg |
| Runtime | Node.js (for Prisma compatibility) |

## 📦 Installation

### 1. Install Dependencies
```bash
npm install next-auth@beta @auth/prisma-adapter
npm install lucide-react
npm install @hookform/resolvers zod react-hook-form
```

### 2. Environment Setup
Update `.env.local` with your actual credentials:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"

# Auth.js v5
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
```

**Get Google OAuth Credentials**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production
```bash
npm run build
npm start
```

## 👥 Demo Accounts

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | SuperAdmin123! |
| Admin | admin@example.com | Admin123! |
| User | user@example.com | User123! |

## 📁 Project Structure

```
secure/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Auth.js handlers
│   │   ├── admin/
│   │   │   ├── users/              # User management APIs
│   │   │   └── posts/              # Post moderation APIs
│   │   └── posts/                  # Post creation API
│   ├── admin/
│   │   ├── page.tsx                # User management (SUPER_ADMIN)
│   │   └── posts/page.tsx          # Post moderation (ADMIN)
│   ├── dashboard/page.tsx          # User dashboard
│   ├── login/page.tsx              # Unified auth page
│   ├── posts/page.tsx              # Public post wall
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Earthy theme styles
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── Sidebar.tsx                 # Glassmorphic navigation
├── lib/
│   ├── auth.ts                     # Auth.js v5 configuration
│   └── prisma.ts                   # Prisma client with PG adapter
├── src/
│   ├── generated/prisma/           # Generated Prisma types
│   └── proxy.ts                    # Middleware (Node.js runtime)
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed script
└── middleware.ts                   # Exports proxy boundary

```

## 🔐 Security Features

### Account Protection
- Prevents linking OAuth accounts to existing email/password accounts
- Detects provider mismatches and denies suspicious sign-ins
- Validates user active status on every request

### Middleware Protection
Located in `src/proxy.ts` (Node.js runtime required):
- Route-level authentication checks
- Role-based authorization
- Automatic redirects for unauthorized access

### Password Security
- Bcrypt hashing with cost factor 12
- Minimum complexity requirements (enforced in validation)

## 🎨 Customization Guide

### Color Palette
Edit CSS variables in `app/globals.css`:
```css
:root {
  --primary: #CC5500;       /* Burnt Orange */
  --secondary: #2D5A27;     /* Forest Green */
  --accent: #4B3621;        /* Earth Brown */
  --surface: #F5F5F4;       /* Stone Grey */
  --background: #FCFAF7;    /* Ivory White */
}
```

### Component Styling
All components in `components/ui/` use Tailwind with earthy theme tokens:
- `bg-[#CC5500]` for primary backgrounds
- `text-[#4B3621]` for high-contrast text
- `rounded-xl` (12px) for consistent borders

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String?       // Only for MANUAL authProvider
  role          Role          @default(USER)
  authProvider  AuthProvider  @default(MANUAL)
  isActive      Boolean       @default(true)
  emailVerified DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

### Post Model
```prisma
model Post {
  id         String   @id @default(cuid())
  title      String
  content    String   @db.Text
  isApproved Boolean  @default(false)
  authorId   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🧪 Testing Workflows

### User Registration (Google OAuth)
1. Click "Sign in with Google" on `/login`
2. Authenticate with Google
3. Auto-created as USER role
4. Redirects to `/dashboard`

### Post Creation & Approval
1. Login as USER
2. Visit `/posts`
3. Click "Create Post"
4. Submit content (goes to pending)
5. Login as ADMIN
6. Visit `/admin/posts`
7. Approve/reject submissions

### User Management
1. Login as SUPER_ADMIN
2. Visit `/admin`
3. Change user roles
4. Toggle active/inactive status
5. View user statistics

## 🚧 Production Considerations

### Before Deployment
- [ ] Replace dummy `AUTH_SECRET` with secure random string
- [ ] Update `DATABASE_URL` with production credentials
- [ ] Configure Google OAuth production URLs
- [ ] Enable HTTPS and update `NEXTAUTH_URL`
- [ ] Set up database backups
- [ ] Configure rate limiting for API routes
- [ ] Add logging and monitoring (e.g., Sentry)
- [ ] Review RBAC permissions for business requirements

### Deployment Platforms
- **Vercel**: Native Next.js support, automatic HTTPS
- **Railway**: PostgreSQL + Next.js templates
- **AWS**: Amplify for frontend, RDS for PostgreSQL
- **DigitalOcean**: App Platform with managed databases

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma 7 Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 🤝 Contributing

This project follows a modular architecture. Key principles:
1. **No middleware.ts dependency**: Use `src/proxy.ts` for Node.js runtime
2. **Strict RBAC**: Always validate roles in API routes
3. **Prisma 7 patterns**: Import from `@/src/generated/prisma/client`
4. **Earth theme consistency**: Use defined color tokens

## 📄 License

MIT License - feel free to use this project as a starter template.

---

**Built with ❤️ using Next.js, Prisma, and Auth.js**
-auth" 
