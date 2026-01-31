# ENIGMA - Task Management System for IIIT Institutions

A full-stack web application for managing tasks, teams, and collaborations within IIIT institutions.

## Technology Stack

- Next.js 15 (React framework with integrated backend)
- TypeScript
- MongoDB (Database)
- Prisma ORM (Database toolkit)
- NextAuth.js (Authentication)
- Tailwind CSS (Styling)

## Features

### Authentication
- User registration with IIIT email validation
- Secure password hashing with bcrypt
- JWT-based session management
- Role-based access control

### Team Management
- Create and join teams using team codes
- Team leader designation
- Maximum 5 members per team
- Team activity tracking

### Task Management
- Admin-only task creation
- Task assignment to individuals or teams
- Priority levels: Low, Medium, High, Critical
- Status workflow: Draft → Assigned → Accepted → In Progress → Completed → Closed
- Due date tracking
- Task comments and discussions

### File Management
- File upload support for task submissions
- Attachment tracking

### Activity Logging
- Complete audit trail of task activities
- User action tracking

## Architecture

This project uses Next.js App Router architecture where the backend is integrated into the frontend application through API Routes and Server Actions.

Backend components:
- API Routes: `/app/api/*` - RESTful endpoints
- Server Actions: `/app/actions/*` - Server-side functions
- Database: MongoDB accessed via Prisma ORM

Frontend components:
- Pages: `/app/*` - React Server Components
- Components: `/components/*` - Reusable UI components

## Database Schema

The application uses MongoDB with the following main collections:

- Users: Authentication and profile data
- Teams: Team information and membership
- Colleges: IIIT institution data
- Tasks: Task details and assignments
- Comments: Task discussions
- Attachments: File uploads
- ActivityLogs: Audit trail

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Docker Desktop (for MongoDB)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ENIGMA-main
```

2. Create environment file
```bash
cp .env.example .env
```

Edit `.env` with appropriate values:
```
DATABASE_URL=mongodb://localhost:27017/enigma-db
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

3. Start MongoDB
```bash
docker compose up -d
```

4. Install dependencies
```bash
npm install
```

5. Setup database
```bash
npx prisma generate
npx prisma db push
```

6. Run the application
```bash
npm run dev
```

Access the application at http://localhost:3000

## Project Structure

```
ENIGMA-main/
├── app/                    Next.js app directory
│   ├── api/               Backend API routes
│   ├── actions/           Server actions
│   ├── auth/              Authentication pages
│   ├── dashboard/         Dashboard page
│   ├── tasks/             Task pages
│   └── teams/             Team pages
├── components/            React components
├── lib/                   Utility functions
│   ├── auth.ts           Authentication config
│   ├── prisma.ts         Database client
│   └── mongodb.ts        MongoDB setup
├── prisma/
│   └── schema.prisma     Database schema
├── public/               Static assets
└── scripts/              Utility scripts
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/signin` - User login
- GET `/api/auth/signout` - User logout

### Teams
- GET `/api/teams` - Get user's team
- POST `/api/teams/create` - Create new team
- POST `/api/teams/join` - Join existing team
- DELETE `/api/teams` - Leave or delete team

### File Upload
- POST `/api/upload` - Upload file

## Development

### Running Tests
```bash
npm run lint
```

### Database Management
```bash
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate client
npx prisma db push   # Push schema changes
```

### Building for Production
```bash
npm run build
npm start
```

## Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Docker containers
- Any Node.js hosting platform

See DEPLOYMENT_GUIDE.md for detailed instructions.

## Environment Variables

Required environment variables:

- `DATABASE_URL` - MongoDB connection string
- `AUTH_SECRET` - Secret key for session encryption (minimum 32 characters)
- `NEXTAUTH_URL` - Application URL

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please refer to the documentation in the `/docs` folder:
- QUICK_START.md - Setup guide
- API_REFERENCE.md - API documentation
- DEPLOYMENT_GUIDE.md - Deployment instructions
- BACKEND_SETUP_GUIDE.md - Architecture overview
