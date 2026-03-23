# 🚀 UpWork Clone API

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

**A freelance marketplace backend API built with NestJS, TypeORM and SQLite**

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Entities](#-entities)
- [Authentication Flow](#-authentication-flow)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Swagger Documentation](#-swagger-documentation)
- [Security](#-security)
- [Module Structure](#-module-structure)

---

## 📖 About

This project is a backend API for a freelance marketplace platform inspired by **Upwork**. The system supports two types of users:

| Role | Description |
|-----|--------|
| 🏢 **CLIENT** | Users who post job listings |
| 💼 **FREELANCER** | Users who apply to jobs |
| 🛡️ **ADMIN** | System administrator |

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Backend Framework | **NestJS v11** |
| Programming Language | **TypeScript** |
| Database | **SQLite** |
| ORM | **TypeORM** |
| Authentication | **JWT** (Access + Refresh Token) |
| Encryption | **bcrypt** |
| Validation | **class-validator** + **class-transformer** |
| API Documentation | **Swagger (OpenAPI)** |
| E-mail | **@nestjs-modules/mailer** + **Nodemailer** (Handlebars) |
| Rate Limiting | **@nestjs/throttler** |
| Task Scheduling | **@nestjs/schedule** |

---

## ✨ Features

### 🔐 Authentication System

- **Access Token** (short-lived) — for protected routes
- **Refresh Token** (long-lived) — for obtaining new access tokens
- Refresh tokens are **stored in the database** and sent via **HTTP-only cookie**
- Token **revoke** mechanism — any session can be invalidated
- **Logout** (current session) and **LogoutAll** (all devices) support
- All active sessions are automatically invalidated when the password is changed

### 👤 User Management

- A **welcome email** is sent upon registration
- Role-based access control (**RBAC**)
- Update own profile, change password, delete account
- Admin can view all users

### 🧹 Cleanup (Automatic Cleanup)

- Runs automatically every week (`@Cron`)
- Revoked and expired tokens are deleted from the database

### 💼 Jobs Module

- CLIENTs can create, update, and delete job listings
- Job status management: `OPEN` / `CLOSED`
- All open jobs can be viewed
- Payment type support: `FIXED` / `HOURLY`
- Admin can delete any job

### 📄 Proposals Module

- FREELANCERs can send proposals to jobs
- Proposal statuses: `PENDING` → `ACCEPTED` / `REJECTED` / `WITHDRAWN`
- CLIENT receives an **email notification** when a new proposal arrives
- FREELANCER receives an **email notification** when proposal status changes
- FREELANCER can only `WITHDRAWN`; CLIENT can `ACCEPTED` / `REJECTED`

### 📧 Mail System

| Event | Template |
|--------|--------|
| Registration | `welcome.hbs` |
| New proposal received | `proposal.hbs` |
| Proposal status changed | `proposalStatus.hbs` |

---

## 📁 Project Structure

```
├── 📁 src
│   ├── 📁 Common
│   │   ├── 📁 Dtos
│   │   │   ├── 📄 auth-response.dto.ts
│   │   │   ├── 📄 change-password.dto.ts
│   │   │   ├── 📄 create-job.dto.ts
│   │   │   ├── 📄 create-user.dto.ts
│   │   │   ├── 📄 createProposal.dto.ts
│   │   │   ├── 📄 login.dto.ts
│   │   │   ├── 📄 update-StatusProposal.dto.ts
│   │   │   ├── 📄 update-statusJob.dto.ts
│   │   │   ├── 📄 update-user.dto.ts
│   │   │   ├── 📄 updateJob.dto.ts
│   │   │   ├── 📄 updateProposal.dto.ts
│   │   │   └── 📄 user-dto.ts
│   │   ├── 📁 Entities
│   │   │   ├── 📄 common.entity.ts
│   │   │   ├── 📄 job.entity.ts
│   │   │   ├── 📄 proposal.entity.ts
│   │   │   ├── 📄 token.entity.ts
│   │   │   └── 📄 user.entity.ts
│   │   ├── 📄 jwt.ts
│   │   └── 📄 type.ts
│   ├── 📁 auth
│   │   ├── 📄 auth.controller.spec.ts
│   │   ├── 📄 auth.controller.ts
│   │   ├── 📄 auth.module.ts
│   │   ├── 📄 auth.service.spec.ts
│   │   └── 📄 auth.service.ts
│   ├── 📁 cleanup
│   │   ├── 📄 cleanup.module.ts
│   │   ├── 📄 cleanup.service.spec.ts
│   │   └── 📄 cleanup.service.ts
│   ├── 📁 decorators
│   │   ├── 📄 currentUser.decorator.ts
│   │   └── 📄 roles.decorator.ts
│   ├── 📁 guards
│   │   ├── 📄 auth.guard.ts
│   │   └── 📄 role.guard.ts
│   ├── 📁 interceptors
│   │   └── 📄 serialize.interceptor.ts
│   ├── 📁 jobs
│   │   ├── 📄 jobs.controller.spec.ts
│   │   ├── 📄 jobs.controller.ts
│   │   ├── 📄 jobs.module.ts
│   │   ├── 📄 jobs.service.spec.ts
│   │   └── 📄 jobs.service.ts
│   ├── 📁 mail
│   │   ├── 📁 templates
│   │   │   ├── 📄 proposal.hbs
│   │   │   ├── 📄 proposalStatus.hbs
│   │   │   └── 📄 welcome.hbs
│   │   ├── 📄 mail.module.ts
│   │   ├── 📄 mail.service.spec.ts
│   │   └── 📄 mail.service.ts
│   ├── 📁 proposals
│   │   ├── 📄 proposals.controller.spec.ts
│   │   ├── 📄 proposals.controller.ts
│   │   ├── 📄 proposals.module.ts
│   │   ├── 📄 proposals.service.spec.ts
│   │   └── 📄 proposals.service.ts
│   ├── 📁 users
│   │   ├── 📄 users.controller.spec.ts
│   │   ├── 📄 users.controller.ts
│   │   ├── 📄 users.module.ts
│   │   ├── 📄 users.service.spec.ts
│   │   └── 📄 users.service.ts
│   ├── 📄 app.controller.spec.ts
│   ├── 📄 app.controller.ts
│   ├── 📄 app.module.ts
│   ├── 📄 app.service.ts
│   ├── 📄 main.ts
│   └── 📄 seed.ts      # Admin.create
├── 📁 test
│   ├── 📄 app.e2e-spec.ts
│   └── ⚙️ jest-e2e.json
├── ⚙️ .gitignore
├── ⚙️ .prettierrc
├── 📝 README.md
├── 📄 db.sqlite
├── 📄 eslint.config.mjs
├── ⚙️ example .env
├── ⚙️ nest-cli.json
├── ⚙️ package-lock.json
├── ⚙️ package.json
└── ⚙️ tsconfig.json
```

---

## 🗃️ Entities

### 👤 User Entity

| Field | Type | Description |
|------|-----|--------|
| `id` | number | Unique identifier |
| `email` | string | Email address |
| `password` | string | Hashed password (hidden) |
| `role` | enum | `CLIENT` / `FREELANCER` / `ADMIN` |
| `name` | string | First name |
| `surname` | string | Last name |
| `phone` | string | Phone number |
| `createdAt` | Date | Creation date |
| `updatedAt` | Date | Last updated date |

### 💼 JobEntity

| Field | Type | Description |
|------|-----|--------|
| `id` | number | Unique identifier |
| `title` | string | Job title |
| `description` | string | Detailed description |
| `paymentType` | enum | `FIXED` / `HOURLY` |
| `price` | number | Budget |
| `category` | string | Category |
| `skills` | string[] | Required skills |
| `status` | enum | `OPEN` / `CLOSED` |
| `user` | User | CLIENT who created the job (ManyToOne) |
| `proposals` | Proposal[] | Received proposals (OneToMany) |

### 📄 Proposal Entity

| Field | Type | Description |
|------|-----|--------|
| `id` | number | Unique identifier |
| `coverLetter` | string | Cover letter |
| `amount` | number | Proposed amount |
| `estimatedDays` | number | Estimated duration (days) |
| `status` | enum | `PENDING` / `ACCEPTED` / `REJECTED` / `WITHDRAWN` |
| `user` | User | FREELANCER who submitted the proposal (ManyToOne) |
| `job` | JobEntity | Job being applied to (ManyToOne) |

### 🔑 TokenEntity

| Field | Type | Description |
|------|-----|--------|
| `id` | number | Unique identifier |
| `tokenHash` | string | Refresh token value |
| `expiresAt` | Date | Expiration date |
| `revoke` | boolean | Revocation status |
| `user` | User | User who owns the token |

### 📦 CommonEntity (Base entity)

All entities extend from this entity:
- `id` — PrimaryGeneratedColumn
- `createdAt` — Auto-generated creation date
- `updatedAt` — Last updated date

---

## 🔄 Authentication Flow

```
User → POST /auth/register
                    │
                    ▼
           Email existence is checked
                    │
                    ▼
           Password is hashed with bcrypt
                    │
                    ▼
           User data is saved to the database
                    │
                    ▼
         Access Token (15 min)  ← Returned in JSON response
         Refresh Token (7 days) ← Stored in HTTP-only cookie
                                   + Written to database
                    │
                    ▼
            Welcome email is sent to the user's inbox

User → POST /auth/login
                    │
                    ▼
           Email + Password are verified
                    │
                    ▼
         Access Token (15 min)  ← Returned in JSON response
         Refresh Token (7 days) ← Stored in HTTP-only cookie
                                   + Written to database
```

**Token refresh:**
```
Refresh Token in Cookie → POST /auth/refresh
                                        │
                                        ▼
                              Token validated (revoke/expired?)
                                        │
                              ┌─────────┴─────────┐
                            Invalid             Valid
                              │                   │
                              ▼                   ▼
                      Error returned        Old token revoked
                    (all sessions may       New token pair generated
                    be revoked on                 │
                    reuse attack)                 ▼
                                            New Access Token returned
                                            New Refresh Token written to cookie
```

---

## 📡 API Endpoints

### 🔐 Auth (`/auth`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|--------|-----------|
| `POST` | `/auth/register` | Register | 3/min |
| `POST` | `/auth/login` | Login | 5/min |
| `POST` | `/auth/refresh` | Token refresh | 5/min |
| `POST` | `/auth/logout` | Logout (current session) | — |
| `POST` | `/auth/logoutall` | Logout from all devices 🔒 | — |
| `GET` | `/auth/profile` | Current user info 🔒 | — |

### 👤 Users (`/users`) 🔒

| Method | Endpoint | Description | Permission |
|--------|----------|--------|-------|
| `GET` | `/users/all` | All users | ADMIN |
| `PATCH` | `/users/:id` | Update profile | Own account |
| `PATCH` | `/users/password/:id` | Change password | Own account |
| `DELETE` | `/users/:id` | Delete account | Own account |

### 💼 Jobs (`/jobs`) 🔒

| Method | Endpoint | Description | Permission |
|--------|----------|--------|-------|
| `POST` | `/jobs` | Create a new job | CLIENT |
| `GET` | `/jobs` | All jobs | Everyone |
| `GET` | `/jobs/:id` | Specific job | Owner |
| `PATCH` | `/jobs/:id` | Update job | CLIENT (owner) |
| `PATCH` | `/jobs/status/:id` | Change job status | CLIENT (owner) |
| `DELETE` | `/jobs/:id` | Delete job | CLIENT (owner) |
| `DELETE` | `/jobs/admin/:id` | Delete job (admin) | ADMIN |

### 📄 Proposals (`/proposals`) 🔒

| Method | Endpoint | Description | Permission |
|--------|----------|--------|-------|
| `POST` | `/proposals/jobs/:jobId` | Send a proposal | FREELANCER |
| `GET` | `/proposals` | Own proposals | Based on role |
| `GET` | `/proposals/:id` | Specific proposal | Owner |
| `PATCH` | `/proposals/:id` | Update proposal | FREELANCER |
| `PATCH` | `/proposals/status/:id` | Change status | CLIENT / FREELANCER |
| `DELETE` | `/proposals/:id` | Delete proposal | FREELANCER |
| `DELETE` | `/proposals/admin/:id` | Delete by admin | ADMIN |

> 🔒 — JWT token required (`Authorization: Bearer <token>`)

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_TIME=15m
JWT_REFRESH_TIME=7d

# Server
PORT=3014
NODE_ENV=development

# Mail (for Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

> ⚠️ Create an [App Password](https://myaccount.google.com/apppasswords) for Gmail (2FA must be enabled)

---

## 📦 Installation

**1. Clone the repo:**
```bash
git clone https://github.com/aghasalimmusayev/upWork.git
cd upWork
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create a `.env` file** (see the example above)

**4. Fill in admin credentials in seed.ts and run the seed script (optional):**
```bash
npm run seed
```

---

## ▶️ Running the App

**Development mode (hot reload):**
```bash
npm run start:dev
```

**Production build:**
```bash
npm run build
npm run start:prod
```

**Test:**
```bash
npm run test
```

**E2E test:**
```bash
npm run test:e2e
```

---

## 📚 Swagger Documentation

After the server is running:

```
http://localhost:3014/api
```

Swagger allows you to:
- ✅ Test all endpoints
- ✅ View request/response schemas
- ✅ Test JWT-protected routes (via the `Authorize` button)

---

## 🛡️ Security

| Mechanism | Description |
|----------|--------|
| **bcrypt** | Passwords are never stored as plain text |
| **HTTP-only Cookie** | Refresh token is protected from XSS attacks |
| **Token Revocation** | Tokens can be invalidated via the `revoke` flag |
| **Weekly Cleanup** | Stale tokens are automatically deleted |
| **Rate Limiting** | Brute-force protection on auth routes |
| **DTO Validation** | All inputs are validated with `class-validator` |
| **CORS** | Only allowed origins are accepted |
| **Role Guard** | Role verification for certain routes |

---

## 🔗 Entity Relationships

```
User (CLIENT)
      │
      │ 1:N
      ▼
  JobEntity ──────── OneToMany ──────► Proposal[]
      │                                     ▲
      │                                     │ N:1
      │                                     │
      └──────────────────────────────  User (FREELANCER)


User
  │
  │ 1:N
  ▼
TokenEntity (refresh tokens)
```

---

## 👨‍💻 Author

**Agasalim Musayev**
- GitHub: [@aghasalimmusayev](https://github.com/aghasalimmusayev)

---
