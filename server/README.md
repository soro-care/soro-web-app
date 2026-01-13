# 🏥 SORO Backend - Mental Health Platform API

**Production-ready NestJS backend for SORO, a comprehensive mental health support platform with booking, PSN training, anonymous stories, and crisis detection.**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/soro-care/soro-web-app.git
cd soro-web-app/server
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Setup database
npx prisma generate
npx prisma db push

# 4. Start server
npm run start:dev

# ✅ API Running: http://localhost:5001/api
# 📚 Docs: http://localhost:5001/api/docs
```

---

## 📋 Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **PostgreSQL** database (or [Neon.tech](https://neon.tech) free tier)
- **npm** or **yarn**

---

## 🔧 Environment Setup

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/soro_db?sslmode=require"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="noreply@soro.care"

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# App Config
NODE_ENV="development"
PORT=5001
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### Generate Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

---

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── users/             # User management
│   │   ├── bookings/          # Counseling bookings
│   │   ├── availability/      # Professional schedules
│   │   ├── notifications/     # Real-time notifications
│   │   ├── blog/              # Blog CMS
│   │   ├── echo/              # Anonymous stories + crisis detection
│   │   ├── survey/            # Mental health assessments
│   │   ├── psn/               # Peer Support Network training
│   │   └── admin/             # Admin dashboard
│   ├── prisma/
│   │   ├── prisma.service.ts  # Prisma client
│   │   └── prisma.module.ts
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── .env                       # Environment variables (create this)
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Setup

### Option 1: Neon.tech (Recommended - Free)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb soro_db

# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/soro_db"
```

### Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

---

## 🏃 Running the Application

### Development Mode (Hot Reload)

```bash
npm run start:dev
```

**Output:**
```
✅ SORO Backend is running!
🚀 Server: http://localhost:5001/api
📚 API Docs: http://localhost:5001/api/docs
🏥 Health: http://localhost:5001/api/health
🌍 Environment: development
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

---

## 📚 API Documentation (Swagger)

**Access Swagger UI:** http://localhost:5001/api/docs

### Testing APIs with Swagger

#### 1. **Register a User**

- Navigate to `Authentication` → `POST /auth/register`
- Click **"Try it out"**
- Fill in the request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

- Click **"Execute"**
- Check response (201 Created)

#### 2. **Verify OTP**

- Go to `POST /auth/verify-otp`
- Use the OTP sent to your email (or check logs in development)
- Click **"Execute"**

#### 3. **Login**

- Navigate to `POST /auth/login`
- Fill credentials:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

- Copy the `accessToken` from response

#### 4. **Authorize Swagger**

- Click **🔓 Authorize** button (top right)
- Paste: `Bearer YOUR_ACCESS_TOKEN`
- Click **"Authorize"** then **"Close"**

#### 5. **Test Protected Endpoints**

Now you can test any protected endpoint:

- `GET /auth/me` - Get your profile
- `POST /bookings` - Create a booking
- `GET /notifications` - Get notifications
- etc.

### Export Collection

- Download OpenAPI JSON: http://localhost:5001/api/docs-json
- Import into Postman or Insomnia

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 🔑 Key Features

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Auth** | `/api/auth/*` | JWT authentication, OTP verification, password reset |
| **Bookings** | `/api/bookings/*` | Create/manage counseling sessions |
| **Availability** | `/api/availability/*` | Professional scheduling |
| **Notifications** | `/api/notifications/*` | Real-time WebSocket + HTTP notifications |
| **Blog** | `/api/blog/*` | Full CMS with categories & comments |
| **Echo** | `/api/echo/*` | Anonymous stories with AI crisis detection |
| **Survey** | `/api/survey/*` | Mental health assessments |
| **PSN** | `/api/psn/*` | Peer Support Network training portal |
| **Admin** | `/api/admin/*` | Dashboard, analytics, user management |

---

## 🛠️ Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Push schema changes
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate dev     # Create migration

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier
npm run test               # Run tests

# Utilities
npm run start:debug        # Start in debug mode
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# Test connection
npx prisma db pull
```

### Port Already in Use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in .env
PORT=3000
```

### Prisma Client Not Generated

```bash
# Clean and regenerate
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 🚢 Deployment

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
flyctl deploy
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 📊 API Endpoints Overview

### Authentication (10 endpoints)
- Register, Login, Logout
- OTP verification
- Password reset flow
- JWT token refresh

### Bookings (7 endpoints)
- Create, Confirm, Cancel
- Reschedule sessions
- View booking history

### Availability (8 endpoints)
- Set professional schedules
- Check slot availability
- Bulk updates

### Notifications (5 endpoints + WebSocket)
- Real-time notifications
- Mark as read
- Push notifications

### Blog (15 endpoints)
- Posts, Categories, Comments
- Search and filter
- Admin moderation

### Echo (12 endpoints)
- Anonymous story sharing
- Crisis detection
- Likes, comments, shares
- Content moderation

### Survey (7 endpoints)
- Submit assessments
- Get recommendations
- Admin analytics

### PSN (14 endpoints)
- Application management
- Module training
- Progress tracking
- Certificates

### Admin (10 endpoints)
- Dashboard analytics
- User management
- System monitoring

**Total: 88+ documented endpoints**

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ Rate limiting ready
- ✅ HIPAA compliance considerations

---

## 📦 Tech Stack

- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JWT + Passport
- **Validation:** class-validator, class-transformer
- **Email:** Resend
- **Storage:** Cloudinary
- **Real-time:** Socket.io
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest

---

## 🤝 Contributing

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/soro-web-app.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🆘 Support

- **Documentation:** http://localhost:5001/api/docs
- **Issues:** https://github.com/soro-care/soro-web-app/issues
- **Email:** support@soro.care

---

## ⭐ Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run start:dev` |
| View API docs | Open http://localhost:5001/api/docs |
| Generate Prisma | `npx prisma generate` |
| Update database | `npx prisma db push` |
| Run tests | `npm test` |
| Build for prod | `npm run build` |
| Deploy | `flyctl deploy` |

---

**Built with ❤️ by the SORO Team** | [Website](https://soro.care) | [GitHub](https://github.com/soro-care)