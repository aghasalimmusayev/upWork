# 🚀 UpWork Clone API

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

**NestJS, TypeORM və SQLite ilə qurulmuş freelance marketplace backend API-si**

</div>

---

## 📋 Mündəricat

- [Haqqında](#-haqqında)
- [Tech Stack](#-tech-stack)
- [Xüsusiyyətlər](#-xüsusiyyətlər)
- [Layihə Strukturu](#-layihə-strukturu)
- [Entities](#-entities)
- [Authentication Flow](#-authentication-flow)
- [API Endpointlər](#-api-endpointlər)
- [Environment Variables](#-environment-variables)
- [Quraşdırma](#-quraşdırma)
- [İşə Salma](#-i̇şə-salma)
- [Swagger Dokumentasiyası](#-swagger-dokumentasiyası)
- [Təhlükəsizlik](#-təhlükəsizlik)
- [Modul Strukturu](#-modul-strukturu)

---

## 📖 Haqqında

Bu layihə **Upwork**-dən ilhamlanan bir freelance marketplace platformasının backend API-sidir. Sistem iki növ istifadəçini dəstəkləyir:

| Rol | Təsvir |
|-----|--------|
| 🏢 **CLIENT** | İş elanı yerləşdirən istifadəçilər |
| 💼 **FREELANCER** | İşlərə müraciət edən istifadəçilər |
| 🛡️ **ADMIN** | Sistem idarəçisi |

---

## 🛠️ Tech Stack

| Kateqoriya | Texnologiya |
|-----------|-------------|
| Backend Framework | **NestJS v11** |
| Proqramlaşdırma Dili | **TypeScript** |
| Verilənlər Bazası | **SQLite** |
| ORM | **TypeORM** |
| Autentifikasiya | **JWT** (Access + Refresh Token) |
| Şifrələmə | **bcrypt** |
| Validasiya | **class-validator** + **class-transformer** |
| API Dokumentasiyası | **Swagger (OpenAPI)** |
| E-mail | **@nestjs-modules/mailer** + **Nodemailer** (Handlebars) |
| Rate Limiting | **@nestjs/throttler** |
| Task Scheduling | **@nestjs/schedule** |

---

## ✨ Xüsusiyyətlər

### 🔐 Authentication Sistemi

- **Access Token** (qısa müddətli) — qorunan route-lar üçün
- **Refresh Token** (uzun müddətli) — yeni access token almaq üçün
- Refresh token-lar **database-də saxlanılır** və **HTTP-only cookie**-də göndərilir
- Token **revoke** mexanizmi — istənilən sessiyanı ləğv etmək mümkündür
- **Logout** (cari sessiya) və **LogoutAll** (bütün cihazlar) dəstəyi
- Şifrə dəyişdirildikdə bütün aktiv sessiyalar avtomatik ləğv edilir

### 👤 İstifadəçi İdarəetməsi

- Qeydiyyat zamanı **xoş gəldin e-maili** göndərilir
- Rol əsaslı giriş kontrolu (**RBAC**)
- Öz profilini yeniləmə, şifrə dəyişdirmə, hesabı silmə
- Admin bütün istifadəçiləri görə bilər

### 💼 Jobs Modulu

- CLIENT-lər iş elanı yarada, yeniləyə, silə bilər
- İş statusunu idarə etmə: `OPEN` / `CLOSED`
- Bütün açıq işləri görüntüləmək mümkündür
- Ödəniş tipi dəstəyi: `FIXED` / `HOURLY`
- Admin istənilən işi silə bilər

### 📄 Proposals Modulu

- FREELANCER-lər işlərə müraciət (proposal) göndərə bilər
- Proposal statusları: `PENDING` → `ACCEPTED` / `REJECTED` / `WITHDRAWN`
- CLIENT yeni proposal aldıqda **e-mail bildirişi** gəlir
- FREELANCER proposal statusu dəyişdikdə **e-mail bildirişi** alır
- FREELANCER yalnız `WITHDRAWN` edə bilər; CLIENT `ACCEPTED` / `REJECTED` edə bilər

### 🧹 Cleanup (Avtomatik Təmizlənmə)

- Hər həftə avtomatik işləyir (`@Cron`)
- Revoke edilmiş və müddəti bitmiş token-lar verilənlər bazasından silinir

### 📧 Mail Sistemi

| Hadisə | Şablon |
|--------|--------|
| Qeydiyyat | `welcome.hbs` |
| Yeni proposal gəldikdə | `proposal.hbs` |
| Proposal statusu dəyişdikdə | `proposalStatus.hbs` |

---

## 📁 Layihə Strukturu

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

| Sahə | Tip | Təsvir |
|------|-----|--------|
| `id` | number | Unikal identifikator |
| `email` | string | E-mail ünvanı |
| `password` | string | Hashed şifrə (gizli) |
| `role` | enum | `CLIENT` / `FREELANCER` / `ADMIN` |
| `name` | string | Ad |
| `surname` | string | Soyad |
| `phone` | string | Telefon nömrəsi |
| `createdAt` | Date | Yaradılma tarixi |
| `updatedAt` | Date | Yenilənmə tarixi |

### 💼 JobEntity

| Sahə | Tip | Təsvir |
|------|-----|--------|
| `id` | number | Unikal identifikator |
| `title` | string | İş başlığı |
| `description` | string | Ətraflı təsvir |
| `paymentType` | enum | `FIXED` / `HOURLY` |
| `price` | number | Büdcə |
| `category` | string | Kateqoriya |
| `skills` | string[] | Tələb olunan bacarıqlar |
| `status` | enum | `OPEN` / `CLOSED` |
| `user` | User | İşi yaradan CLIENT (ManyToOne) |
| `proposals` | Proposal[] | Gələn müraciətlər (OneToMany) |

### 📄 Proposal Entity

| Sahə | Tip | Təsvir |
|------|-----|--------|
| `id` | number | Unikal identifikator |
| `coverLetter` | string | Müraciət məktubu |
| `amount` | number | Təklif edilən məbləğ |
| `estimatedDays` | number | Təxmini iş müddəti (gün) |
| `status` | enum | `PENDING` / `ACCEPTED` / `REJECTED` / `WITHDRAWN` |
| `user` | User | Müraciət edən FREELANCER (ManyToOne) |
| `job` | JobEntity | Müraciət edilən iş (ManyToOne) |

### 🔑 TokenEntity

| Sahə | Tip | Təsvir |
|------|-----|--------|
| `id` | number | Unikal identifikator |
| `tokenHash` | string | Refresh token dəyəri |
| `expiresAt` | Date | Bitmə tarixi |
| `revoke` | boolean | Ləğv statusu |
| `user` | User | Tokeni olan istifadəçi |

### 📦 CommonEntity (Baza entity)

Bütün entity-lər bu entity-dən extends edir:
- `id` — PrimaryGeneratedColumn
- `createdAt` — Avtomatik yaradılma tarixi
- `updatedAt` — Yenilənmə tarixi

---

## 🔄 Authentication Flow

```
İstifadəçi → POST /auth/login
                    │
                    ▼
           Email + Şifrə yoxlanır
                    │
                    ▼
         Access Token (15 dəq)  ← JSON response-da qaytarılır
         Refresh Token (7 gün)  ← HTTP-only cookie-də saxlanılır
                                   + Database-ə yazılır
```

**Token yenilənmə:**
```
Cookie-dəki Refresh Token → POST /auth/refresh
                                        │
                                        ▼
                              Köhnə token silinir
                              Yeni token cütü yaradılır
                                        │
                                        ▼
                              Yeni Access Token qaytarılır
                              Yeni Refresh Token cookie-yə yazılır
```

---

## 📡 API Endpointlər

### 🔐 Auth (`/auth`)

| Method | Endpoint | Təsvir | Rate Limit |
|--------|----------|--------|-----------|
| `POST` | `/auth/register` | Qeydiyyat | 3/dəq |
| `POST` | `/auth/login` | Giriş | 5/dəq |
| `POST` | `/auth/refresh` | Token yenilənməsi | 5/dəq |
| `POST` | `/auth/logout` | Çıxış (cari sessiya) | — |
| `POST` | `/auth/logoutall` | Bütün cihazlardan çıxış 🔒 | — |
| `GET` | `/auth/profile` | Cari istifadəçi məlumatı 🔒 | — |

### 👤 Users (`/users`) 🔒

| Method | Endpoint | Təsvir | İcazə |
|--------|----------|--------|-------|
| `GET` | `/users/all` | Bütün istifadəçilər | ADMIN |
| `PATCH` | `/users/:id` | Profil yenilənməsi | Özü |
| `PATCH` | `/users/password/:id` | Şifrə dəyişdirmə | Özü |
| `DELETE` | `/users/:id` | Hesabı silmə | Özü |

### 💼 Jobs (`/jobs`) 🔒

| Method | Endpoint | Təsvir | İcazə |
|--------|----------|--------|-------|
| `POST` | `/jobs` | Yeni iş yaratmaq | CLIENT |
| `GET` | `/jobs` | Bütün işlər | Hər kəs |
| `GET` | `/jobs/:id` | Konkret iş | Sahibi |
| `PATCH` | `/jobs/:id` | İşi yeniləmək | CLIENT (sahibi) |
| `PATCH` | `/jobs/status/:id` | İş statusunu dəyişmək | CLIENT (sahibi) |
| `DELETE` | `/jobs/:id` | İşi silmək | CLIENT (sahibi) |
| `DELETE` | `/jobs/admin/:id` | İşi silmək (admin) | ADMIN |

### 📄 Proposals (`/proposals`) 🔒

| Method | Endpoint | Təsvir | İcazə |
|--------|----------|--------|-------|
| `POST` | `/proposals/jobs/:jobId` | Müraciət göndərmək | FREELANCER |
| `GET` | `/proposals` | Öz müraciətlər | Öz roluna görə |
| `GET` | `/proposals/:id` | Konkret müraciət | Sahibi |
| `PATCH` | `/proposals/:id` | Müraciəti yeniləmək | FREELANCER |
| `PATCH` | `/proposals/status/:id` | Status dəyişmək | CLIENT / FREELANCER |
| `DELETE` | `/proposals/:id` | Müraciəti silmək | FREELANCER |
| `DELETE` | `/proposals/admin/:id` | Admin tərəfindən silmək | ADMIN |

> 🔒 — JWT token tələb olunur (`Authorization: Bearer <token>`)

---

## ⚙️ Environment Variables

`.env` faylı yaradın:

```env
# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_TIME=15m
JWT_REFRESH_TIME=7d

# Server
PORT=3014
NODE_ENV=development

# Mail (Gmail üçün)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

> ⚠️ Gmail üçün [App Password](https://myaccount.google.com/apppasswords) yaradın (2FA aktiv olmalıdır)

---

## 📦 Quraşdırma

**1. Repo-nu klonlayın:**
```bash
git clone https://github.com/aghasalimmusayev/upWork.git
cd upWork
```

**2. Asılılıqları quraşdırın:**
```bash
npm install
```

**3. `.env` faylı yaradın** (yuxarıdakı nümunəyə baxın)

**4. Admin melumatlarini seed.ts faylinda yazib seed skriptini çalışdırın (isteğe bağlı):**
```bash
npm run seed
```

---

## ▶️ İşə Salma

**Development rejimi (hot reload):**
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

## 📚 Swagger Dokumentasiyası

Server işə salındıqdan sonra:

```
http://localhost:3014/api
```

Swagger sizə imkan verir:
- ✅ Bütün endpoint-ləri test edin
- ✅ Request/response sxemlərini görün
- ✅ JWT token ilə qorunan route-ları test edin (`Authorize` düyməsi)

---

## 🛡️ Təhlükəsizlik

| Mexanizm | Təsvir |
|----------|--------|
| **bcrypt** | Şifrələr heç vaxt plain text saxlanılmır |
| **HTTP-only Cookie** | Refresh token XSS hücumlarından qorunur |
| **Token Revocation** | `revoke` flag ilə token-lar ləğv edilə bilər |
| **Rate Limiting** | Auth route-larında brute-force qoruması |
| **DTO Validasiya** | `class-validator` ilə bütün input-lar yoxlanır |
| **CORS** | Yalnız icazəli origin-lər qəbul edilir |
| **Role Guard** | Hər route üçün rol yoxlaması |
| **Weekly Cleanup** | Köhnəlmiş token-lar avtomatik silinir |

---

## 🔗 Entity Əlaqələri

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
TokenEntity (refresh token-lar)
```

---

## 👨‍💻 Müəllif

**Agasalim Musayev**
- GitHub: [@aghasalimmusayev](https://github.com/aghasalimmusayev)

---

