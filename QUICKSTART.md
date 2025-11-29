# 🚀 Quick Start Guide

Get your Electronic Key Locker Management System up and running in 5 minutes!

## 📋 Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- MongoDB v4.4+ ([Download](https://www.mongodb.com/try/download/community))
- Git

## ⚡ Fast Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd webapp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/keymanager
PORT=5000
JWT_SECRET=your-secret-key-here-change-this
NODE_ENV=development
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 4. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Interactive Demo:** Open `demo.html` in your browser

## 👤 First Login

### Option 1: Create Admin via MongoDB

```javascript
// Connect to MongoDB
mongo

// Switch to database
use keymanager

// Create admin user
db.users.insertOne({
  userId: "ADMIN001",
  name: "System Admin",
  email: "admin@example.com",
  password: "$2a$10$YourBcryptHashHere", // Hash your password first
  role: "admin",
  createdAt: new Date()
})
```

### Option 2: Register & Update Role

1. Go to http://localhost:3000/register
2. Register a new account
3. In MongoDB, update the user's role to "admin":

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## 🎮 Try the Demo

Open `demo.html` in your browser to explore all features without setup!

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the [API Examples](./README.md#-api-documentation)
- Check [Architecture](./README.md#-system-architecture)
- Review [Security Best Practices](./README.md#-security)

## 🆘 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Linux/Mac:
sudo systemctl status mongodb

# Or start MongoDB
sudo systemctl start mongodb
```

### Port Already in Use

```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
PORT=5001
```

### Module Not Found Error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Need Help?

- Check [Issues](https://github.com/your-repo/issues)
- Read [Full Documentation](./README.md)
- Email: support@example.com

---

**⚡ Pro Tip:** Use the `demo.html` file to understand the system before diving into code!
