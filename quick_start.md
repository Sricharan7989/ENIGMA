# ENIGMA Quick Start Guide

## Overview

ENIGMA is a full-stack Next.js application with an integrated backend. This guide will help you set up and run the project locally.

## Prerequisites

Install the following software:

1. Node.js (version 20 or higher) - https://nodejs.org
2. Docker Desktop - https://www.docker.com/products/docker-desktop
3. Git - https://git-scm.com

## Setup Instructions

## 1. Environment Configuration

Create a `.env` file in the project root with the following content:

```
DATABASE_URL=mongodb://localhost:27017/enigma-db
AUTH_SECRET=generate-a-random-32-character-string-here
NEXTAUTH_URL=http://localhost:3000
```

To generate a secure AUTH_SECRET, use one of these commands:

Linux/Mac:
```bash
openssl rand -base64 32
```

Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Start MongoDB

Ensure Docker Desktop is running, then execute:

```bash
docker compose up -d
```

This starts MongoDB in detached mode.

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Generate the Prisma client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

Optional: Seed initial data (colleges):

```bash
npm run seed:colleges
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Architecture

This is a monolithic Next.js application where backend and frontend are unified:

```
app/
├── api/              Backend API routes
├── actions/          Server-side actions
├── auth/             Authentication pages
├── dashboard/        Dashboard interface
├── tasks/            Task management pages
└── teams/            Team management pages

lib/
├── auth.ts           NextAuth configuration
├── prisma.ts         Database client
└── mongodb.ts        MongoDB connection

prisma/
└── schema.prisma     Database schema

components/           React components
```

## Key Features

- User authentication with IIIT email validation
- Team creation and management
- Task assignment and tracking
- File upload support
- Role-based access control (Admin/User/Member)
- Activity logging

## Common Commands

Development:
```bash
npm run dev          Start development server
npm run build        Build for production
npm start            Start production server
npm run lint         Run linter
```

Database:
```bash
npx prisma studio    Open database GUI
npx prisma generate  Regenerate Prisma client
npx prisma db push   Push schema changes
```

Docker:
```bash
docker compose up -d      Start MongoDB
docker compose down       Stop MongoDB
docker compose logs       View logs
```

## Troubleshooting

### Database Connection Issues

Verify Docker is running:
```bash
docker ps
```

If no containers are listed, start MongoDB:
```bash
docker compose up -d
```

### Prisma Client Errors

Regenerate the Prisma client:
```bash
npx prisma generate
```

### Port Conflicts

If port 3000 is already in use, either:
- Stop the other application using port 3000
- Run on a different port: `PORT=3001 npm run dev`

### Module Not Found

Remove and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Usage

### First Time Setup

1. Navigate to http://localhost:3000/auth/signup
2. Register with an IIIT email address (e.g., user@iiits.ac.in)
3. Sign in with your credentials

### Creating a Team

1. Go to the Teams page
2. Click "Create Team"
3. Enter team details
4. Share the generated team code with members

### Joining a Team

1. Go to the Teams page
2. Click "Join Team"
3. Enter the team code provided by your team leader

### Admin Access

To create an admin user, run:
```bash
npx tsx scripts/seed_admin.ts
```

Or use Prisma Studio to manually change a user's role to ADMIN:
```bash
npx prisma studio
```

## Additional Information

For detailed API documentation, see API_REFERENCE.md
For deployment instructions, see DEPLOYMENT_GUIDE.md
For architecture details, see BACKEND_SETUP_GUIDE.md
