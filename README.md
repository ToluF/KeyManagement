# 🔐 Electronic Key Locker Management System

A comprehensive full-stack web application for managing electronic key lockers in office complexes. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this system provides robust key inventory management, transaction tracking, and role-based access control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## ✨ Features

### 🔑 Key Management
- **Complete Key Inventory Control**: Add, edit, delete, and track keys
- **Real-time Status Tracking**: Monitor key availability (available, checked-out, lost, unavailable)
- **Location Management**: Track physical location of keys
- **Key History**: Complete audit trail for each key
- **Bulk Operations**: Import/export key data

### 📊 Transaction Management
- **Draft Transactions**: Create and modify transactions before checkout
- **Atomic Operations**: Database transactions ensure data consistency
- **Partial Returns**: Return keys individually from multi-key transactions
- **Lost Key Handling**: Mark keys as lost without completing transaction
- **Transaction History**: Complete audit trail with timestamps

### 👥 User Management
- **Role-Based Access Control**: Admin, Issuer, and User roles
- **Department Organization**: Group users by department
- **User Registration**: Self-service registration with approval workflow
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

### 📝 Request System
- **User-Initiated Requests**: Regular users can request keys
- **Multi-Date Selection**: Propose multiple preferred dates/times
- **Purpose Documentation**: Record reason for key request
- **Messaging System**: Communication between requesters and issuers
- **Approval Workflow**: Admin/Issuer approval with direct transaction creation

### 📈 Analytics & Reporting
- **Dashboard Analytics**: Real-time key status and transaction trends
- **Visual Charts**: Pie charts, line graphs, and activity feeds
- **Custom Reports**: Generate reports with date range filtering
- **Export Functionality**: Export data to CSV and PDF formats
- **Recent Activity Feed**: Monitor latest key movements

### 🔒 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing with salt rounds
- **Role-Based Authorization**: Granular permission system
- **Audit Logging**: Complete action history with user attribution
- **Input Validation**: Server-side validation with Joi schemas

### 🎨 User Experience
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user actions
- **Intuitive Navigation**: Breadcrumb navigation and clear routing
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │ Transactions │  │ Key Inventory│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Requests   │  │    Users     │  │   Reports    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Authentication│  │ Authorization│  │Audit Logging │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │  Middleware  │  │   Routes     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────┐
│                  Database (MongoDB)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Users     │  │     Keys     │  │ Transactions │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Requests   │  │  Audit Logs  │  │   Settings   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v7.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.4 or higher ([Download](https://www.mongodb.com/try/download/community)) or MongoDB Atlas account
- **Git**: For version control ([Download](https://git-scm.com/))

### Optional
- **MongoDB Compass**: GUI for MongoDB ([Download](https://www.mongodb.com/try/download/compass))
- **Postman**: API testing tool ([Download](https://www.postman.com/downloads/))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd webapp
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create new .env
```

2. **Configure Environment Variables**

Edit `backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/keymanager
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/keymanager?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

⚠️ **Security Note**: 
- Change `JWT_SECRET` to a long, random string (minimum 32 characters)
- Never commit `.env` files to version control
- Use different secrets for development and production

### Frontend Configuration

The frontend is configured to proxy API requests to the backend. This is set in `frontend/package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

For production builds, update the API base URL in your deployment configuration.

## 🎯 Running the Application

### Development Mode

#### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

#### Option 2: Using Concurrently (Recommended)

Install concurrently globally:
```bash
npm install -g concurrently
```

Create a root `package.json` with:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
    "install-all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

Then run:
```bash
npm run dev
```

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with a static server or integrate with backend
```

### Default Login Credentials

After first installation, you'll need to create an admin user. You can either:

1. **Use the registration endpoint** (then manually update the role in MongoDB)
2. **Create directly in MongoDB**:

```javascript
// Connect to MongoDB and run:
use keymanager

db.users.insertOne({
  userId: "ADMIN001",
  name: "System Administrator",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  createdAt: new Date()
})
```

3. **Use the migration script** (if provided in `/backend/migration/`)

## 👥 User Roles

### 🔴 Admin (Full Access)
- ✅ Complete key inventory management (CRUD operations)
- ✅ Create, manage, and delete transactions
- ✅ User management (add, edit, delete users)
- ✅ Approve/reject key requests
- ✅ View audit logs
- ✅ Generate reports and analytics
- ✅ Configure system settings
- ✅ Access to all system features

### 🟡 Issuer (Limited Admin)
- ✅ Create and manage transactions
- ✅ Issue and return keys
- ✅ View key inventory (read-only)
- ✅ Approve/reject key requests
- ✅ View dashboard analytics
- ❌ Cannot modify key inventory
- ❌ Cannot manage users
- ❌ Cannot access system settings

### 🟢 User (Basic Access)
- ✅ Submit key requests
- ✅ View personal request history
- ✅ View personal dashboard
- ✅ Message with issuers about requests
- ❌ Cannot access key inventory
- ❌ Cannot create transactions
- ❌ Cannot access admin features

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "department": "IT"
}

Response: {
  "token": "jwt-token-here",
  "user": { "id": "...", "name": "...", "email": "...", "role": "user" }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: {
  "token": "jwt-token-here",
  "user": { "id": "...", "name": "...", "email": "...", "role": "..." }
}
```

### Key Management Endpoints

#### Get All Keys
```http
GET /api/keys
Authorization: Bearer <token>

Response: [
  {
    "_id": "...",
    "keyCode": "KEY001",
    "description": "Office 101 Master Key",
    "location": "Building A",
    "status": "available",
    "type": "master"
  }
]
```

#### Add Key
```http
POST /api/keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "keyCode": "KEY001",
  "description": "Office 101 Master Key",
  "location": "Building A",
  "type": "master"
}
```

#### Update Key Status
```http
PUT /api/keys/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "unavailable"
}
```

### Transaction Endpoints

#### Create Draft Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-object-id"
}

Response: {
  "id": "transaction-id",
  "transactionId": "TXN-123456",
  "status": "draft"
}
```

#### Add Keys to Transaction
```http
POST /api/transactions/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "keyIds": ["key-id-1", "key-id-2"]
}
```

#### Finalize Transaction (Checkout)
```http
POST /api/transactions/:id/checkout
Authorization: Bearer <token>

Response: {
  "status": "active",
  "transactionId": "TXN-123456",
  "checkoutDate": "2024-01-15T10:30:00Z"
}
```

#### Return Key
```http
POST /api/transactions/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "keyId": "key-id"
}
```

#### Mark Key as Lost
```http
POST /api/transactions/mark-lost
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "transaction-id",
  "keyId": "key-id"
}
```

### Request Endpoints

#### Create Key Request
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "keys": ["key-id-1", "key-id-2"],
  "purpose": "Need keys for maintenance work",
  "preferredDates": [
    {
      "date": "2024-01-20",
      "timeSlot": "09:00 AM - 11:00 AM"
    }
  ]
}
```

#### Get User's Requests
```http
GET /api/requests/my-requests
Authorization: Bearer <token>
```

#### Approve Request and Create Transaction
```http
POST /api/transactions/from-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestId": "request-id"
}
```

### User Management Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "issuer",
  "department": "Security"
}
```

### Analytics Endpoints

#### Get Dashboard Analytics
```http
GET /api/keys/analytics
Authorization: Bearer <token>

Response: {
  "totalKeys": 150,
  "keyStatuses": [
    { "status": "available", "count": 100 },
    { "status": "checked-out", "count": 40 },
    { "status": "lost", "count": 5 }
  ]
}
```

#### Get Transaction Trends
```http
GET /api/transactions/trends
Authorization: Bearer <token>

Response: {
  "data": [
    { "date": "2024-01-15", "count": 25 },
    { "date": "2024-01-16", "count": 30 }
  ]
}
```

For complete API documentation, see the [API Documentation](./docs/API.md) file.

## 📂 Project Structure

```
webapp/
├── backend/
│   ├── server.js                      # Main server entry point
│   ├── package.json                   # Backend dependencies
│   ├── .env                          # Environment variables (not in git)
│   │
│   ├── Middleware/
│   │   ├── authMiddleware.js         # JWT authentication & RBAC
│   │   ├── auditLogger.js            # Action logging middleware
│   │   ├── dbConnection.js           # MongoDB connection setup
│   │   ├── transactionAuth.js        # Transaction-specific auth
│   │   └── validateIds.js            # ID validation helpers
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── user.js                   # User model with roles
│   │   ├── keys.js                   # Key inventory model
│   │   ├── transaction.js            # Transaction model
│   │   ├── Request.js                # Key request model
│   │   ├── auditLog.js              # Audit trail model
│   │   └── settings.js               # System settings
│   │
│   ├── controllers/                  # Business logic
│   │   ├── transactionController.js  # Transaction operations
│   │   ├── keys.js                   # Key management
│   │   ├── users.js                  # User management
│   │   ├── requestController.js      # Request handling
│   │   ├── reportController.js       # Analytics & reports
│   │   ├── settingsController.js     # Settings management
│   │   └── loginController.js        # Authentication logic
│   │
│   ├── routes/                       # API route definitions
│   │   ├── transactionRoutes.js
│   │   ├── key.js
│   │   ├── users.js
│   │   ├── requestRoutes.js
│   │   ├── audit.js
│   │   ├── reports.js
│   │   ├── settings.js
│   │   └── loginRoute.js
│   │
│   └── migration/                    # Database migration scripts
│       ├── migrate.js
│       ├── add-userIds.js
│       └── updateUserRoles.js
│
├── frontend/
│   ├── package.json                  # Frontend dependencies
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   │
│   └── src/
│       ├── App.js                    # Main app component & routing
│       ├── index.js                  # React entry point
│       ├── AuthContext.js            # Authentication context
│       ├── ProtectedRoute.js         # Route guards
│       │
│       ├── pages/                    # Page components
│       │   ├── Dashboard.js          # Admin/Issuer dashboard
│       │   ├── UserDashboard.js      # Regular user dashboard
│       │   ├── LoginPage.js          # Login page
│       │   ├── register.js           # Registration page
│       │   ├── exchange.js           # Transaction management
│       │   ├── MyRequests.js         # User's requests
│       │   ├── ReportsPage.js        # Analytics reports
│       │   ├── audit.js              # Audit log viewer
│       │   ├── settings.js           # System settings
│       │   ├── UserPage.js           # User management
│       │   ├── UnauthorizedPage.js   # 403 error page
│       │   │
│       │   ├── keyInventory/         # Key management pages
│       │   │   ├── KeyListPage.js
│       │   │   ├── KeyDetailPage.js
│       │   │   ├── KeyHistoryPage.js
│       │   │   ├── LostKeysPage.js
│       │   │   └── DeleteKeyPage.js
│       │   │
│       │   └── Users/                # User management pages
│       │       ├── AddUserPage.js
│       │       └── EditUserRolePage.js
│       │
│       └── components/               # Reusable components
│           ├── Breadcrumbs.js
│           ├── RequestForm.js
│           ├── RequestModal.js
│           │
│           ├── layout/               # Layout components
│           │   └── PageLayout/
│           │       ├── MainDashboardLayout.js
│           │       ├── KeyInventoryLayout.js
│           │       └── UserManagementLayout.js
│           │
│           ├── transactionComponents/
│           │   ├── TransactionWizard.js
│           │   ├── TransactionDetailsModal.js
│           │   └── TransactionStatusBadge.js
│           │
│           ├── keyComponents/
│           │   └── ...
│           │
│           ├── userComponents/
│           │   └── ...
│           │
│           └── charts/               # Data visualization
│               ├── AnalyticsSummary.js
│               ├── KeyStatusChart.js
│               ├── TransactionTrends.js
│               └── RecentActivityChart.js
│
├── README.md                         # This file
├── demo.html                         # Interactive demo showcase
└── .gitignore
```

## 💾 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: "USR001",              // Unique identifier
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$hashed...",  // Bcrypt hash
  role: "admin",                 // admin, issuer, user
  department: "IT",
  createdAt: ISODate()
}
```

### Keys Collection
```javascript
{
  _id: ObjectId,
  keyCode: "KEY001",
  description: "Office 101 Master Key",
  type: "master",
  location: "Building A",
  status: "available",           // available, reserved, checked-out, lost, unavailable
  reservationExpiry: ISODate(),
  reservedBy: ObjectId,
  currentTransaction: ObjectId,
  transactionHistory: [
    {
      transaction: ObjectId,
      status: "checked-out",
      date: ISODate()
    }
  ],
  createdAt: ISODate()
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  transactionId: "TXN-123456",
  user: ObjectId,                // Recipient
  issuer: ObjectId,              // Who issued the keys
  items: [
    {
      key: ObjectId,
      status: "checked-out"      // pending, checked-out, returned, lost
    }
  ],
  status: "active",              // draft, active, completed, cancelled
  checkoutDate: ISODate(),
  expectedReturn: ISODate(),
  source: "manual",              // manual, request
  relatedRequest: ObjectId,
  actionLogs: [
    {
      action: "checkout",
      key: ObjectId,
      timestamp: ISODate(),
      performedBy: ObjectId
    }
  ],
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### Requests Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  issuer: ObjectId,
  keys: [ObjectId],
  preferredDates: [
    {
      date: "2024-01-20",
      timeSlot: "09:00 AM - 11:00 AM"
    }
  ],
  purpose: "Maintenance work",
  status: "pending",             // pending, approved, rejected, completed
  messages: [
    {
      sender: ObjectId,
      content: "When can I pick up?",
      timestamp: ISODate()
    }
  ],
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### Audit Logs Collection
```javascript
{
  _id: ObjectId,
  actionType: "key_checkout",
  user: ObjectId,
  description: "Key KEY001 checked out",
  timestamp: ISODate(),
  metadata: {
    keyId: ObjectId,
    transactionId: "TXN-123456"
  }
}
```

## 🔒 Security

### Authentication
- **JWT Tokens**: Used for stateless authentication
- **Token Expiry**: 7-day expiration (configurable)
- **Password Hashing**: Bcrypt with 10 salt rounds
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

### Authorization
- **Role-Based Access Control (RBAC)**: Three-tier role system
- **Route Protection**: Frontend and backend route guards
- **Permission Checks**: Granular permission validation per endpoint
- **Audit Trail**: All critical actions logged with user attribution

### Best Practices
- **Environment Variables**: Sensitive data in .env files
- **Input Validation**: Server-side validation with Joi schemas
- **SQL Injection Prevention**: MongoDB with Mongoose ODM
- **XSS Protection**: React's built-in XSS prevention
- **CORS Configuration**: Restricted to specific origins

### Production Security Checklist
- [ ] Change default JWT secret to strong random string
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Use httpOnly cookies for tokens
- [ ] Implement refresh token mechanism
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

### Manual Testing

Use the provided `demo.html` file to explore the application's features without setting up the full stack.

## 🚀 Deployment

### Backend Deployment (Node.js)

#### Option 1: Traditional Hosting (VPS/Dedicated Server)

```bash
# Install PM2 for process management
npm install -g pm2

# Start the application
cd backend
pm2 start server.js --name "key-locker-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option 2: Cloud Platforms

**Heroku:**
```bash
heroku create key-locker-api
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
git push heroku main
```

**AWS Elastic Beanstalk:**
```bash
eb init key-locker-api
eb create key-locker-env
eb deploy
```

**DigitalOcean App Platform:**
- Connect your GitHub repository
- Configure environment variables
- Deploy with one click

### Frontend Deployment

#### Option 1: Static Hosting

```bash
# Build the production bundle
cd frontend
npm run build

# Deploy build/ folder to:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - GitHub Pages
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

#### Option 2: Serve with Backend

```bash
# Copy build to backend
cp -r frontend/build backend/public

# Update backend server.js
app.use(express.static('public'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

### Database Deployment

#### MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Whitelist IP addresses
4. Create database user
5. Get connection string
6. Update MONGODB_URI in environment variables

#### Self-Hosted MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian:
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Environment Configuration

Create production `.env`:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/keymanager
PORT=5000
JWT_SECRET=use-a-very-long-random-secret-minimum-32-characters
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/keymanager
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Code Style Guidelines
- Use ESLint configuration provided
- Follow existing code structure
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

### Reporting Bugs
- Use GitHub Issues
- Include reproduction steps
- Provide error logs
- Specify environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

### Documentation
- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)

### Community
- GitHub Issues: [Report bugs or request features]
- Email: support@example.com
- Discord: [Join our community]

### FAQ

**Q: How do I reset my password?**
A: Contact your system administrator to reset your password.

**Q: Can users check out keys themselves?**
A: Only if the admin enables "allowSelfCheckout" in settings. Otherwise, users must submit requests.

**Q: What happens if a key is marked as lost?**
A: The key status changes to "lost" but remains in the system. The transaction continues and can be completed when other keys are returned.

**Q: How long are reservations valid?**
A: Reservations automatically expire after 24 hours if not checked out.

**Q: Can I export transaction history?**
A: Yes, use the Reports page to export data to CSV or PDF format.

## 🎉 Acknowledgments

- React team for the amazing framework
- MongoDB team for the robust database
- Express.js community
- All open-source contributors

---

**Built with ❤️ for secure key management**

*Version 1.0.0 - Last Updated: 2024*
