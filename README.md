# 🌸 Inora – Creative Gathering Platform

Inora is a modern web platform designed to help users easily organize small-scale creative gatherings (up to 12 people). It provides a simple and intuitive experience for planning, customizing, and booking events with friends.

---

## 🔗 Live Demo

👉 **Frontend:** https://your-frontend-link.com  
👉 **Backend API:** https://your-backend-link.com  

> Replace these links with your deployed URLs (Vercel, Railway, etc.)

---

## ✨ Features

- User authentication (Login / Register)
- Create and manage reservations
- Browse creative activities and venues
- Booking system with admin validation
- Reviews and feedback system
- Admin dashboard for managing events
- Responsive and modern UI

---

## 🛠 Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS

**Backend**
- Express.js (REST API)
- Node.js

**Database**
- PostgreSQL
- Prisma ORM

**Other**
- JWT Authentication
- Stripe (Payments)
- Nodemailer (Emails)
- Railway (Deployment)

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository

git clone https://github.com/your-username/inora.git
cd inora

### 2. Install dependencies

#### Frontend

cd "front-end"
npm install

#### Backend

cd "back-end"
npm install

#### 3. Environment variables
Create a .env file in the backend folder:

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/inora_db"
JWT_SECRET="your_secret_key"

# Admin
ADMIN_CODE="your_admin_access_code"

# Stripe
STRIPE_SECRET_KEY="your_stripe_key"

# Nodemailer (email service)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_app_password"

Create a .env.local file in the frontend folder:

NEXT_PUBLIC_API_URL=http://localhost:4000

#### 4. Setup database
Make sure PostgreSQL is running, then:

cd "back-end"
npx prisma migrate dev
npx prisma generate

#### 5. Run the project
Start backend

cd "back-end"
npm run dev

Start frontend

cd "front-end"
npm run dev

### 🔐 Roles

User → can browse & book events
Admin → requires ADMIN_CODE to access admin features

### 📌 Notes

Admin must confirm a booking before payment
Payments are handled via Stripe (use test mode locally)
Email notifications are sent via Nodemailer
Make sure PostgreSQL is running before starting the backend


#### Host link

https://gleaming-trust-production-e46f.up.railway.app/
