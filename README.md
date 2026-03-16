# UpWork Clone API

A backend API for a freelance marketplace platform inspired by Upwork.  
This project is built with **NestJS**, **TypeORM**, and **SQLite**, and provides a secure authentication system with **JWT access tokens** and **refresh tokens** stored in the database.

The system supports two types of users:

- **CLIENT** – users who post jobs
- **FREELANCER** – users who apply for jobs

This project is designed with clean architecture principles and can easily scale into a production-ready freelance marketplace.

---

# Tech Stack
* Backend Framework
  - NestJS
* Language
  - TypeScript
* Database
  - SQLite
* ORM
  - TypeORM
* Authentication
  - JWT (Access Token + Refresh Token)
* Security
  - bcrypt password hashing
  - HTTP throttling (rate limiting)
* Validation
  - class-validator
  - class-transformer
* API Documentation
  - Swagger
* Task Scheduling
  - NestJS Schedule
---

# Features
### Authentication System
* Secure authentication flow implemented using:
  - Access Tokens (short-lived)
  - Refresh Tokens (long-lived)
  - Token persistence in database
  - Token revocation support

* Authentication features include:
  - User registration
  - Login
  - Token refresh
  - Logout
  - LogoutAll

---
### Role Based Users
* Users have a role field:
  - CLIENT
  - FREELANCER

This allows implementing role-based permissions in the future.
Example use cases:

* CLIENT
  - create jobs
  - hire freelancers
* FREELANCER
  - browse jobs
  - send proposals
---

### Secure Password Handling
* Passwords are never stored in plain text.
**Implementation:**
  - Passwords hashed using **bcrypt**
  - Minimum password length validation
  - Secure comparison during login

---
### Token Management
* Refresh tokens are stored in the database.
**Token entity includes:**
  - tokenHash
  - expiration date
  - revocation flag
  - relation to user

* This allows:
  - logout from specific sessions
  - token invalidation
  - better security

---

# Project Structure

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
│   │   └── 📄 currentUser.decorator.ts
│   ├── 📁 guards
│   │   └── 📄 auth.guard.ts
│   ├── 📁 interceptors
│   │   └── 📄 serialize.interceptor.ts
│   ├── 📁 jobs
│   │   ├── 📄 jobs.controller.spec.ts
│   │   ├── 📄 jobs.controller.ts
│   │   ├── 📄 jobs.module.ts
│   │   ├── 📄 jobs.service.spec.ts
│   │   └── 📄 jobs.service.ts
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
│   └── 📄 main.ts
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

# Entities

## User
* Represents a system user.
* Fields:
  - id
  - createdAt
  - updatedAt
  - email
  - password
  - role
  - name
  - surname
  - tokens relation
  - jobs ralation
  - proposals relation
---

## JobEntity
* Represents created jobs.
  - id
  - createdAt
  - updatedAt
  - title
  - description
  - paymentType
  - price
  - category
  - skills
  - status
  - ManyToOne relation with user
  - OneToMany relation with proposal

## ProposalEntity
* Represents created proposal to jobs.
  - id
  - createdAt
  - updatedAt
  - coverLetter
  - amount
  - status
  - estimatedDays
  - ManyToOne relation with User
  - ManyToOne relation with Job

## TokenEntity
* Represents stored refresh tokens.
  - id
  - tokenHash
  - createdAt
  - expiresAt
  - revoke
  - user relation

---

## CommonEntity
* Base entity used for shared fields.
  - id
  - createdAt
  - updatedAt

---

# Authentication Flow

**Login process:**
1. User sends credentials
2. Server validates email and password
3. Server generates:
  - Access Token
  - Refresh Token
4. Access token is returned to client
5. Refresh token is stored in database and res.cookies

**Access Token:**
  - short lifetime
  - used for protected routes
**Refresh Token:**
  - longer lifetime
  - used to generate new access tokens

---

# Security Considerations

* This project implements several security practices:
  - Password hashing with bcrypt
  - Refresh token storage in database and cookie(http only)
  - Token revocation capability
  - Request validation using DTOs
  - Rate limiting with NestJS throttler

---

# Jobs Module
The Jobs module allows clients to publish work opportunities and freelancers to browse available projects.
A job represents a project posted by a client that freelancers can apply to.
* Typical job information includes:
```
| Field          | Description                              |
| -------------- | ---------------------------------------- |
| id             | Unique identifier                        |
| title          | Job title                                |
| description    | Detailed job description                 |
| paymentType    | Type of payment (FIXED or HOURLY)        |
| price / budget | Budget allocated for the job             |
| category       | Job category                             |
| skills         | Required skills                          |
| createdAt      | Creation timestamp                       |
| client         | Reference to the user who posted the job |
```

### The platform supports two payment models:
**Fixed Price**
  - The client sets a fixed amount for the entire project.
**Hourly**
  - The client sets a budget range based on hourly work.

### Typical REST endpoints for jobs:
```
POST /jobs
Create a new job

GET /jobs
Get all jobs

GET /jobs/:id
Get a specific job

PATCH /jobs/:id
Update job

DELETE /jobs/:id
Delete job

```
* Authorization rules:
  - Only CLIENT users can create jobs
  - Only job owner can update or delete a job


# Proposals Module

* The Proposals module allows freelancers to apply for jobs posted by clients.
A proposal represents a freelancer’s offer to complete a job.

* A proposal contains the following information:
```
| Field         | Description                |
| ------------- | -------------------------- |
| id            | Unique identifier          |
| jobId         | Job reference              |
| freelancerId  | User who sent the proposal |
| coverLetter   | Message from freelancer    |
| bidAmount     | Proposed price             |
| estimatedDays | Estimated completion time  |
| status        | Proposal status            |
| createdAt     | Creation timestamp         |
```
* A proposal can have different statuses during its lifecycle.
  - PENDING
  - ACCEPTED
  - REJECTED
  - WITHDRAWN


* Proposal Endpoints (Typical)
```
POST /proposals
Send a proposal

GET /proposals/job/:jobId
Get proposals for a job

GET /proposals/user/:userId
Get proposals sent by a freelancer

PATCH /proposals/:id/status
Update proposal status

DELETE /proposals/:id
Withdraw proposal
```

**Authorization rules:**
  - Only FREELANCER users can send proposals
  - Only CLIENT users can accept or reject proposals

### Relationship between entities:
```
User (CLIENT)
        │
        │ 1
        │
        ▼
      Jobs
        │
        │ 1
        │
        ▼
    Proposals
        ▲
        │
        │ N
        │
User (FREELANCER)
```

# Environment Variables
* Create a `.env` file in the root directory.
  - JWT_ACCESS_SECRET=access_secret_key
  - JWT_REFRESH_SECRET=refresh_secret_key
  - JWT_EXPIRES_IN=10m
  - JWT_REFRESH_TTL=7d

# Installation
  - Clone the repository
  - git clone <https://github.com/aghasalimmusayev/upWork.git>

  - Install dependencies
  - npm install

# Running the Application

**Development mode**
*npm run start:dev*

**Production build**
*npm run build*
*npm run start:prod*

---

# API Documentation

* Swagger documentation is available after running the server.
  - Open in browser:
*http://localhost:3014/api*

* Swagger allows you to:
  - test endpoints
  - view request schemas
  - view response structures

---




