# Star Light Construction Management System - Backend

This is the backend API for the Star Light Construction Management System, built with Node.js, Express, TypeScript, and MySQL.

## Features

- RESTful API with Express.js
- TypeScript for type safety
- MySQL database with Sequelize ORM
- JWT-based authentication
- Role-based access control
- File upload support
- Email notifications
- Comprehensive error handling
- Request validation with Joi
- Security middleware (Helmet, CORS, Rate limiting)
- Logging system
- Database migrations and seeders

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and other configuration.

4. Create the database:
```sql
CREATE DATABASE star_light_cms;
```

5. Run database migrations:
```bash
npm run migrate
```

6. Seed the database with initial data:
```bash
npm run seed
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo last migration
- `npm run seed` - Run database seeders
- `npm run seed:undo` - Undo all seeders

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Inventory
- `GET /api/inventory/products` - Get all products
- `GET /api/inventory/categories` - Get all categories
- `GET /api/inventory/suppliers` - Get all suppliers

### Financial
- `GET /api/quotations` - Get all quotations
- `POST /api/quotations` - Create new quotation
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create new purchase order
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice

### Tenders & Feedback
- `GET /api/tenders` - Get all tenders
- `POST /api/tenders` - Create new tender
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Submit feedback

### Reports
- `GET /api/reports/dashboard` - Get dashboard metrics
- `GET /api/reports/projects` - Get project reports
- `GET /api/reports/inventory` - Get inventory reports

## Database Schema

The database includes the following main tables:
- `users` - User accounts and authentication
- `user_profiles` - User profile information
- `projects` - Construction projects
- `tasks` - Project tasks
- `categories` - Product categories
- `suppliers` - Supplier information
- `products` - Product catalog
- `quotations` - Price quotations
- `quotation_items` - Quotation line items

## Environment Variables

Key environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_HOST` - Database host
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `SMTP_HOST` - Email server host
- `SMTP_USER` - Email username
- `SMTP_PASSWORD` - Email password

## Security

The API includes several security measures:
- JWT token authentication
- Role-based access control
- Request rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Testing

Run the test suite:
```bash
npm test
```

Tests include:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database operation tests

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Run database migrations in production
4. Start the production server:
```bash
npm start
```

## Contributing

1. Follow TypeScript and ESLint conventions
2. Write tests for new features
3. Update documentation as needed
4. Follow the existing code structure and patterns