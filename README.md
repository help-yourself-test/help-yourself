# Help Yourself - Job Portal Platform

A comprehensive job portal platform built with React.js frontend and Node.js backend, featuring role-based authentication for Job Seekers and Job Posters with automated CI/CD deployment.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** package manager
- **MongoDB** database (Local or Atlas) - [Setup Guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (for deployment) - [Download here](https://docker.com/)
- **Azure CLI** (for cloud deployment) - [Install Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## 📋 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd help-yourself-admin/my-app
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Environment Configuration

#### Frontend Environment Variables

Create `.env.development` in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

#### Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit the `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/help-yourself
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/help-yourself

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Step 4: Database Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `backend/.env`
4. Add your IP address to the whitelist

#### Option B: Local MongoDB

```bash
# macOS (with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download MongoDB Community Server and follow installation guide

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

### Step 5: Initialize Database

```bash
# Navigate to backend directory
cd backend

# Add sample users to database
node createUsersComplete.js

# Verify users were created
node verifyUsers.js
```

## 🎮 Running the Application

### Development Mode (Recommended)

```bash
# Start both frontend and backend simultaneously
npm run start:dev
```

### Manual Startup

```bash
# Terminal 1 - Backend Server
cd backend
npm start

# Terminal 2 - Frontend Server (new terminal)
npm start
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 👥 Test Accounts

### Job Seekers

- **Email**: alice.johnson@example.com | **Password**: Password123!
- **Email**: david.chen@example.com | **Password**: Password123!

### Job Posters

- **Email**: michael.thompson@techcorp.com | **Password**: Password123!
- **Email**: sarah.williams@innovatedesign.com | **Password**: Password123!

## 📱 Available Scripts

### Frontend Commands

```bash
npm start                    # Start React development server
npm run build               # Build for production
npm test                    # Run tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
npm run start:dev           # Start both frontend and backend
npm run docker:build        # Build Docker image
npm run docker:run          # Run Docker container
npm run deploy:test         # Test deployment locally
```

### Backend Commands

```bash
cd backend
npm start                   # Start Node.js server
npm run dev                 # Start with nodemon (auto-reload)
node createUsersComplete.js # Add sample users
node verifyUsers.js         # Verify users in database
```

## 🏗️ Project Structure

```
help-yourself-admin/my-app/
├── .github/workflows/      # GitHub Actions CI/CD
├── public/                 # Static files
├── src/                    # React source code
│   ├── components/         # Reusable components
│   │   ├── JobSeekerProfile/
│   │   ├── JobPosterProfile/
│   │   └── AdminProfile/
│   ├── pages/              # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Profile/
│   │   └── Jobs/
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── styles/             # CSS files
├── backend/                # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── controllers/        # Route controllers
│   └── config/             # Database configuration
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Local Docker setup
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```

## 🌟 Features

### Role-Based Authentication

- **Job Seekers**: Profile management, job search, application tracking
- **Job Posters**: Company profiles, job posting, applicant management
- **Admins**: User management, platform oversight

### Job Seeker Features

- ✅ Comprehensive profile with skills and experience
- ✅ Resume upload and document management
- ✅ Job search and filtering
- ✅ Application tracking
- ✅ Profile completion percentage

### Job Poster Features

- ✅ Organization profile management
- ✅ Job posting and management
- ✅ Applicant tracking and communication
- ✅ Company details and contact information

### Technical Features

- ✅ JWT-based authentication
- ✅ MongoDB database integration
- ✅ Responsive design with modern UI
- ✅ Docker containerization
- ✅ Automated CI/CD pipeline
- ✅ Security best practices

## 🚀 Production Deployment

This project includes automated CI/CD deployment to Azure using GitHub Actions.

### Prerequisites for Deployment

- GitHub repository
- Azure subscription
- Azure CLI installed locally

### Step 1: Azure Resources Setup

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Create Resource Group
az group create --name help-yourself-rg --location eastus

# Create Container Registry
az acr create --resource-group help-yourself-rg \
  --name helpyourselfacr --sku Basic --admin-enabled true

# Create App Service Plan
az appservice plan create --name help-yourself-plan \
  --resource-group help-yourself-rg --sku B1 --is-linux

# Create Web App
az webapp create --resource-group help-yourself-rg \
  --plan help-yourself-plan --name help-yourself-admin-app \
  --deployment-container-image-name helpyourselfacr.azurecr.io/help-yourself-admin:latest

# Get Container Registry credentials
az acr credential show --name helpyourselfacr
```

### Step 2: GitHub Secrets Configuration

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add:

| Secret Name                    | Description                 | How to Get                           |
| ------------------------------ | --------------------------- | ------------------------------------ |
| `AZURE_ACR_USERNAME`           | Container Registry Username | From `az acr credential show` output |
| `AZURE_ACR_PASSWORD`           | Container Registry Password | From `az acr credential show` output |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Web App Publish Profile     | Download from Azure Portal           |

#### Getting the Publish Profile:

1. Go to Azure Portal → App Services → your-app-name
2. Click **Get publish profile** to download the XML file
3. Copy the entire XML content as the secret value

### Step 2.1: Branch Protection Setup (Recommended)

Set up branch protection for the `main` branch:

1. Go to **Settings** → **Branches** in your GitHub repo
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Step 3: Production Environment Variables

Create `.env.production` with your production values:

```env
REACT_APP_API_URL=https://your-production-api.com
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
```

### Step 4: Deployment Process

#### Automatic Deployment

1. **Push to main branch** triggers production deployment
2. **Push to develop** triggers development CI
3. **Pull requests** trigger automated testing

#### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Azure** workflow
3. Click **Run workflow** on main branch

### Step 5: Monitoring & Debugging

```bash
# Check deployment logs
az webapp log tail --name help-yourself-admin-app --resource-group help-yourself-rg

# View container logs
az webapp log show --name help-yourself-admin-app --resource-group help-yourself-rg
```

## 🐳 Docker Deployment

### Local Docker Testing

```bash
# Build and run locally
npm run docker:build
npm run docker:run

# Or using docker-compose
docker-compose up --build

# Access at http://localhost:3000
```

### Docker Features

- ✅ Multi-stage builds for optimized images
- ✅ Nginx reverse proxy with security headers
- ✅ Health checks and monitoring
- ✅ Production-ready configuration

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Encryption**: bcrypt hashing
- **Environment Variables**: Secure config management
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Sanitized user inputs
- **HTTPS Support**: SSL/TLS encryption
- **Security Headers**: XSS, CSRF protection
- **Dependency Scanning**: Automated vulnerability checks

## 📊 CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment.

### Workflow Overview

```
Feature Branch → PR to develop → Development CI
                                       ↓
Main Branch → Production CI → Docker Build → Azure Deploy → Health Check
```

### Development Workflow (`development.yml`)

**Triggers**: Push to `develop`, `feature/*` branches, PRs to `develop`

- ✅ Code linting and formatting
- ✅ Unit tests with coverage
- ✅ Build verification
- ✅ Security auditing
- ✅ CodeQL analysis

### Production Deployment (`deploy.yml`)

**Triggers**: Push to `main` branch

- ✅ Full test suite execution
- ✅ Security vulnerability scan
- ✅ Docker image build with caching
- ✅ Azure Container Registry push
- ✅ Azure App Service deployment
- ✅ Health check verification
- ✅ Automatic rollback on failure

### Development Process

1. **Create Feature Branch:**

   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   ```

2. **Development CI runs automatically**

   - Tests, linting, build checks
   - Security auditing

3. **Create Pull Request to `develop`**

   - Code review process
   - Additional CI checks

4. **Merge to `main` for Production**
   - Full deployment pipeline runs
   - Automatic deployment to Azure

### Monitoring Deployments

- **GitHub Actions**: Monitor in the **Actions** tab
- **Azure Logs**: Use Azure CLI commands
- **Health Checks**: Automatic verification post-deployment

## 🔧 Troubleshooting

### Common Issues

**Application not starting:**

```bash
# Check Node.js version
node --version  # Should be v18+

# Verify dependencies
npm install
cd backend && npm install

# Check environment variables
cat backend/.env
```

**Database connection issues:**

```bash
# Verify MongoDB is running
# For local MongoDB:
brew services list | grep mongodb

# For Atlas, check connection string and IP whitelist
```

**Build failures:**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check for conflicting ports
lsof -i :3000
lsof -i :3001
```

**Docker issues:**

```bash
# Clean Docker system
docker system prune -a

# Rebuild without cache
docker build --no-cache -t help-yourself-admin .

# Check container logs
docker logs <container-id>
```

**GitHub Actions deployment failures:**

```bash
# Common fixes:
# 1. Verify GitHub secrets are set correctly
# 2. Check Azure resource names match workflow
# 3. Ensure ACR login credentials are valid
# 4. Verify App Service configuration

# Debug locally:
npm run docker:build  # Test Docker build locally
npm run deploy:test   # Test full deployment process
```

**Environment variable issues:**

```bash
# Frontend env vars not loading:
# 1. Ensure variables start with REACT_APP_
# 2. Restart development server after changes
# 3. Check .env.development and .env.production files

# Backend env vars:
# 1. Verify backend/.env file exists
# 2. Check variable names match exactly
# 3. Restart backend server after changes
```

## 🎯 Best Practices

1. **Development**

   - Use feature branches for new development
   - Write tests for new features
   - Follow ESLint and Prettier configurations
   - Keep dependencies updated

2. **Security**

   - Never commit secrets to version control
   - Use environment variables for configuration
   - Regularly update dependencies
   - Monitor for security vulnerabilities

3. **Deployment**
   - Test locally before pushing
   - Monitor deployment logs
   - Verify application health after deployment
   - Use staged rollouts for major changes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Check the troubleshooting section above
- Review GitHub Actions logs for deployment issues
- Create an issue in the repository
- Contact the development team

---

## 🎉 Congratulations!

Your Help Yourself job portal is now ready for development and deployment!

### Quick Commands Summary:

```bash
# Development
npm run start:dev          # Start full application

# Testing
npm run test:coverage      # Run tests with coverage

# Docker
npm run docker:build       # Build container
npm run docker:run         # Run container

# Deployment
git push origin main       # Deploy to production
```

**Happy Coding! 🚀**
│ ├── services/ # API services
│ ├── styles/ # CSS files
│ └── App.js # Main App component
├── backend/ # Node.js backend
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── middleware/ # Express middleware
│ ├── config/ # Configuration files
│ ├── utils/ # Utility functions
│ └── server.js # Express server
├── package.json # Frontend dependencies
└── README.md # This file

````

## 🔧 Technology Stack

### Frontend

- **React 19.1.1** - UI Framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Lucide React** - Icons
- **React Toastify** - Notifications
- **Tailwind CSS** - Styling

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
````

#### MongoDB Connection Issues

1. Check if MongoDB is running
2. Verify connection string in `.env`
3. Ensure network access (for Atlas)

#### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables

- Ensure `.env` file exists in `backend/` directory
- Check all required variables are set
- No spaces around `=` in `.env` file

## 🔐 Features

- **User Authentication** (JWT-based)
- **Role-based Access** (Job Seekers vs Job Posters)
- **Job Management** (Create, Read, Update, Delete)
- **User Profiles** (Skills, Experience, Company Info)
- **Search & Filter** Jobs
- **Application Management**
- **Admin Panel** (User approval, Job moderation)
- **Responsive Design** (Mobile-friendly)

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Endpoints

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job (Job Posters only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/applications` - Get user applications

## 🚀 Deployment

### Frontend Deployment

```bash
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend Deployment

1. Set environment variables on your server
2. Install dependencies: `npm install --production`
3. Start server: `npm start`

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-secret-key>
PORT=3001
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Check the troubleshooting section above
- Review GitHub Actions logs for deployment issues
- Create an issue in the repository
- Contact the development team

---

## 🎉 Congratulations!

Your Help Yourself job portal is now ready for development and deployment!

### Quick Commands Summary:

```bash
# Development
npm run start:dev          # Start full application

# Testing
npm run test:coverage      # Run tests with coverage

# Docker
npm run docker:build       # Build container
npm run docker:run         # Run container

# Deployment
git push origin main       # Deploy to production
```

**Happy Coding! 🚀**

---

## 📋 Quick Setup Checklist

### Local Development

- [ ] Node.js v18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install` in root and backend)
- [ ] Environment files configured (`.env.development`, `backend/.env`)
- [ ] Sample users created (`node createUsersComplete.js`)
- [ ] Application running (`npm run start:dev`)

### Production Deployment

- [ ] GitHub repository created
- [ ] Azure subscription active
- [ ] Azure CLI installed
- [ ] Azure resources created (Resource Group, ACR, App Service)
- [ ] GitHub secrets configured
- [ ] Branch protection enabled
- [ ] Production environment variables set
- [ ] First deployment successful (`git push origin main`)

### Verification

- [ ] Local app accessible at http://localhost:3000
- [ ] Test accounts can login successfully
- [ ] Docker build works locally
- [ ] GitHub Actions workflows pass
- [ ] Production app accessible via Azure URL
