# Crimson Club API

Backend API for Crimson Club habit tracking application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `api/` directory (see `ENV_TEMPLATE.md` for details):

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/crimson_club"
JWT_SECRET="your-32-char-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Set Up Database

```bash
# Run migrations
npm run migrate

# Seed initial data (badges, etc.)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 📚 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run migrate` - Run database migrations
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run migrate:reset` - Reset database (⚠️ deletes all data)
- `npm run seed` - Seed database with initial data
- `npm run studio` - Open Prisma Studio (database GUI)
- `npm run generate` - Generate Prisma client
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🗄️ Database

### PostgreSQL Setup (Local)

#### Using Docker:

```bash
docker run --name crimson-db \\
  -e POSTGRES_USER=crimson \\
  -e POSTGRES_PASSWORD=crimson \\
  -e POSTGRES_DB=crimson_club \\
  -p 5432:5432 \\
  -d postgres:15
```

Then update `.env`:
```
DATABASE_URL="postgresql://crimson:crimson@localhost:5432/crimson_club"
```

#### Using Homebrew (macOS):

```bash
brew install postgresql@15
brew services start postgresql@15
createdb crimson_club
```

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npm run migrate

# Reset database (development only)
npm run migrate:reset
```

## 🔐 Authentication

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add `http://localhost:5173` to authorized redirect URIs
6. Copy Client ID and Secret to `.env`

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

#### Authentication
```http
POST /api/auth/oauth/google
Body: { "token": "google_id_token" }
```

#### Users
```http
GET /api/users/me
Authorization: Bearer <jwt_token>

PATCH /api/users/me
Authorization: Bearer <jwt_token>
Body: { "settings": { "theme": "dark" } }
```

For complete API documentation, see [../design/api-specification.md](../design/api-specification.md)

## 🏗️ Project Structure

```
api/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── journeys/    # Journey CRUD (TODO)
│   │   ├── checkins/    # Check-ins (TODO)
│   │   ├── analytics/   # Analytics (TODO)
│   │   └── badges/      # Badges & streaks (TODO)
│   ├── middleware/      # Auth, error handling
│   ├── lib/            # Utilities (prisma, logger)
│   ├── jobs/           # Background jobs (TODO)
│   └── main.ts         # App entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Logging

Logs are written to:
- Console (development)
- `logs/error.log` (production errors)
- `logs/combined.log` (production all logs)

## 🔧 Development Tips

### Prisma Studio

Open a GUI to browse your database:

```bash
npm run studio
```

### Watch Mode

Development server auto-reloads on file changes:

```bash
npm run dev
```

### Type Safety

TypeScript strict mode enabled. Run type check:

```bash
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check if PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Test connection: `psql $DATABASE_URL`

### JWT Errors
- Ensure `JWT_SECRET` is set and >32 characters
- Check token expiry (default 7 days)

### Google OAuth Errors
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check redirect URI matches Google Console config

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ chars)
- [ ] Configure production `DATABASE_URL`
- [ ] Set proper `CORS_ORIGIN`
- [ ] Run `npm run migrate:deploy`
- [ ] Set up database backups
- [ ] Configure logging/monitoring

### Build for Production

```bash
npm run build
npm start
```

## 📚 Additional Resources

- [Design Documentation](../design/)
- [API Specification](../design/api-specification.md)
- [Database Schema](../design/database-schema.md)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT

