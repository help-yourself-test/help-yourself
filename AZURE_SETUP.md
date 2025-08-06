# Azure DevOps CI/CD Setup Guide for Help Yourself Project

## 🚀 Overview
This guide will help you set up a complete CI/CD pipeline using Azure DevOps to automatically deploy your React frontend and Node.js backend to Azure when code is pushed to the main branch.

## 📋 Prerequisites

### 1. Azure Account
- Sign up for Azure: https://azure.microsoft.com/free/
- You'll get $200 in free credits for 30 days

### 2. Azure DevOps Account
- Sign up for Azure DevOps: https://dev.azure.com/
- Create a new project for "Help Yourself"

### 3. GitHub Repository
- Your code should be in a GitHub repository
- Repository: https://github.com/bkshaw1994/help-yourself

## 🏗️ Azure Resource Setup

### Step 1: Create Azure Resources

1. **Login to Azure Portal:** https://portal.azure.com/

2. **Create Resource Group:**
   ```bash
   az group create --name help-yourself-rg --location "East US"
   ```

3. **Deploy Infrastructure using ARM Template:**
   ```bash
   az deployment group create \
     --resource-group help-yourself-rg \
     --template-file azure-resources.json \
     --parameters projectName=help-yourself \
                 mongodbConnectionString="your-mongodb-atlas-connection-string" \
                 jwtSecret="your-secure-jwt-secret-key"
   ```

### Step 2: Get Required Service Connection Details

After deployment, note down these values:
- **Static Web App Deployment Token:** Found in Azure Portal > Static Web Apps > Deployment tokens
- **Container Registry Login Server:** Found in Azure Portal > Container Registry > Access keys
- **Container App Environment:** Created automatically

## 🔧 Azure DevOps Setup

### Step 1: Create Azure DevOps Project

1. Go to https://dev.azure.com/
2. Click "New Project"
3. Name: "Help Yourself"
4. Visibility: Private
5. Click "Create"

### Step 2: Connect GitHub Repository

1. In Azure DevOps, go to **Project Settings** > **Service connections**
2. Click **New service connection** > **GitHub**
3. Authorize Azure DevOps to access your GitHub account
4. Select your repository: `bkshaw1994/help-yourself`

### Step 3: Create Azure Service Connection

1. Go to **Project Settings** > **Service connections**
2. Click **New service connection** > **Azure Resource Manager**
3. Choose **Service principal (automatic)**
4. Select your Azure subscription
5. Select resource group: `help-yourself-rg`
6. Name: `azure-help-yourself-connection`
7. Click **Save**

### Step 4: Set Up Pipeline Variables

1. Go to **Pipelines** > **Library**
2. Click **+ Variable group**
3. Name: `help-yourself-variables`
4. Add these variables:

| Variable Name | Value | Secret |
|---------------|-------|---------|
| `AZURE_SERVICE_CONNECTION` | `azure-help-yourself-connection` | No |
| `AZURE_RESOURCE_GROUP` | `help-yourself-rg` | No |
| `AZURE_CONTAINER_REGISTRY` | `helpselfregistry.azurecr.io` | No |
| `AZURE_CONTAINER_APP_ENVIRONMENT` | `help-yourself-env` | No |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Get from Azure Portal | Yes |
| `MONGODB_URI` | Your MongoDB connection string | Yes |
| `JWT_SECRET` | Your JWT secret key | Yes |

## 🚀 Pipeline Setup

### Step 1: Create Pipeline

1. In Azure DevOps, go to **Pipelines** > **Pipelines**
2. Click **New pipeline**
3. Choose **GitHub**
4. Select your repository: `help-yourself`
5. Choose **Existing Azure Pipelines YAML file**
6. Select branch: `main`
7. Path: `/azure-pipelines.yml`
8. Click **Continue**

### Step 2: Configure Pipeline Variables

1. Click **Variables** in the pipeline editor
2. Link the variable group you created: `help-yourself-variables`
3. Click **Save**

### Step 3: Run the Pipeline

1. Click **Save and run**
2. Add commit message: "Add Azure DevOps CI/CD pipeline"
3. Click **Save and run**

## 📦 What the Pipeline Does

### Build Stage:
1. **Install Dependencies:** Both frontend and backend
2. **Run Tests:** Jest tests for frontend, backend tests
3. **Build Frontend:** Creates optimized React build
4. **Create Artifacts:** Packages frontend and backend for deployment

### Deploy Stage:
1. **Deploy Frontend:** To Azure Static Web Apps
2. **Build Container:** Creates Docker image for backend
3. **Deploy Backend:** To Azure Container Apps

### Post-Deploy:
1. **Health Checks:** Verifies both services are running
2. **Integration Tests:** Optional API testing

## 🔍 Monitoring and Troubleshooting

### Pipeline Monitoring:
- **Azure DevOps:** Pipelines > Your Pipeline > Runs
- **Build Logs:** Click on any run to see detailed logs
- **Test Results:** View test results and coverage

### Application Monitoring:
- **Frontend:** Azure Portal > Static Web Apps > Browse
- **Backend:** Azure Portal > Container Apps > Application Url
- **Logs:** Azure Portal > Container Apps > Log Stream

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify package.json scripts
   - Review test failures

2. **Deployment Failures:**
   - Check service connection permissions
   - Verify Azure resource names
   - Review container registry access

3. **Runtime Issues:**
   - Check environment variables
   - Verify MongoDB connection
   - Review application logs

## 🌍 Accessing Your Deployed Application

After successful deployment:

- **Frontend URL:** `https://help-yourself-frontend.azurestaticapps.net`
- **Backend API:** `https://help-yourself-backend.azurecontainerapps.io/api`
- **Health Check:** `https://help-yourself-backend.azurecontainerapps.io/api/debug/health`

## 🔄 Continuous Deployment

Once set up, every push to the `main` branch will:
1. ✅ Trigger the pipeline automatically
2. ✅ Run tests and build the application
3. ✅ Deploy to Azure if tests pass
4. ✅ Notify you of deployment status

## 💰 Cost Estimation

**Free Tier Usage:**
- Azure Static Web Apps: Free tier (0.5GB bandwidth/month)
- Azure Container Apps: Free tier (180,000 vCPU-seconds/month)
- Azure Container Registry: Basic tier ($5/month)
- Log Analytics: Pay-per-use (minimal for small apps)

**Total estimated cost:** ~$5-10/month for a small application

## 🆘 Support

If you need help:
1. Check Azure DevOps pipeline logs
2. Review Azure Portal resource health
3. Check application logs in Azure Portal
4. Contact Azure support if needed

---

**Next Steps:**
1. Follow this guide step by step
2. Test the pipeline with a small code change
3. Monitor the deployment
4. Set up alerts and monitoring as needed
