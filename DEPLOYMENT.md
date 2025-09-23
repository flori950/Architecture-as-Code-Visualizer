# 🚀 FTP Deployment Setup Guide

This guide will help you configure automatic FTP deployment for the Architecture-as-Code Visualizer to your server's `/aac` folder.

## 📋 Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 🔑 Production FTP Secrets (Required)

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name    | Description              | Example                                 |
| -------------- | ------------------------ | --------------------------------------- |
| `FTP_SERVER`   | Your FTP server hostname | `ftp.yourserver.com` or `192.168.1.100` |
| `FTP_USERNAME` | Your FTP username        | `your_ftp_username`                     |
| `FTP_PASSWORD` | Your FTP password        | `your_secure_password`                  |

### 🧪 Optional Staging FTP Secrets

If you want separate staging deployment (recommended):

| Secret Name            | Description                                                 | Example                  |
| ---------------------- | ----------------------------------------------------------- | ------------------------ |
| `STAGING_FTP_SERVER`   | Staging FTP server (optional, uses production if not set)   | `staging.yourserver.com` |
| `STAGING_FTP_USERNAME` | Staging FTP username (optional, uses production if not set) | `staging_username`       |
| `STAGING_FTP_PASSWORD` | Staging FTP password (optional, uses production if not set) | `staging_password`       |

## 📁 Deployment Structure

### Production Deployment

- **Target Folder**: `/aac/`
- **Trigger**: Push to `master` or `main` branch
- **Files Deployed**: Built application from `dist/` folder

### Staging Deployment

- **Target Folder**: `/aac-staging/`
- **Trigger**: Pull requests or manual workflow dispatch
- **Files Deployed**: Built application with staging indicators

## 🔧 How to Set Up GitHub Secrets

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets

1. Click **New repository secret**
2. Enter the secret name (e.g., `FTP_SERVER`)
3. Enter the secret value (e.g., `ftp.yourserver.com`)
4. Click **Add secret**

### Step 3: Repeat for All Required Secrets

Add all the required secrets listed above.

## 🚀 Deployment Process

### Automatic Deployment

1. **Push to master/main**: Triggers production deployment to `/aac/`
2. **Pull Request**: Triggers staging deployment to `/aac-staging/`

### Manual Deployment

1. Go to **Actions** tab in your repository
2. Click **🚀 Deploy Architecture-as-Code Visualizer**
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow**

## 📂 Server Directory Structure

After deployment, your server will have:

```
/aac/                          # Production deployment
├── index.html                 # Main application
├── assets/                    # CSS, JS, and other assets
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── ...
├── examples/                  # Example configurations
│   ├── docker-compose-example.yml
│   ├── terraform-example.hcl
│   └── ...
└── favicon.ico                # Site favicon

/aac-staging/                  # Staging deployment (if configured)
├── index.html                 # [STAGING] prefixed application
├── assets/
└── ...
```

## 🔍 Verification

### Check Deployment Status

1. Go to **Actions** tab in your repository
2. Check the latest workflow run
3. Green checkmark = successful deployment
4. Red X = deployment failed (check logs)

### Access Your Application

- **Production**: `https://yourserver.com/aac/`
- **Staging**: `https://yourserver.com/aac-staging/`

## 🛠️ Troubleshooting

### Common Issues

#### 1. FTP Connection Failed

- **Problem**: Cannot connect to FTP server
- **Solution**:
  - Verify `FTP_SERVER` secret is correct
  - Check if FTP server accepts connections from GitHub's IP ranges
  - Ensure FTP port 21 is open

#### 2. Authentication Failed

- **Problem**: FTP login fails
- **Solution**:
  - Verify `FTP_USERNAME` and `FTP_PASSWORD` secrets
  - Check if account has write permissions to `/aac/` folder

#### 3. Permission Denied

- **Problem**: Cannot write to target directory
- **Solution**:
  - Ensure `/aac/` directory exists on server
  - Verify FTP user has write permissions to this directory
  - Create the directory manually if needed

#### 4. Files Not Appearing

- **Problem**: Deployment succeeds but files don't appear
- **Solution**:
  - Check if `/aac/` is the correct path on your server
  - Some servers use different path structures
  - Try using `/public_html/aac/` or `/htdocs/aac/`

### Getting Help

1. **Check Workflow Logs**: Go to Actions → Click on failed workflow → View detailed logs
2. **Verify Secrets**: Ensure all required secrets are properly set
3. **Test FTP Connection**: Try connecting manually with an FTP client using the same credentials

## 🔒 Security Notes

- Never commit FTP credentials to your repository
- Use strong, unique passwords for FTP accounts
- Consider using SFTP if your server supports it
- Regularly rotate FTP passwords
- Limit FTP account permissions to only necessary directories

## 📝 Next Steps

1. ✅ Add FTP secrets to GitHub repository
2. ✅ Push code to trigger deployment
3. ✅ Verify application is accessible at `https://yourserver.com/aac/`
4. ✅ Set up custom domain (optional)
5. ✅ Configure SSL certificate (recommended)

---

🎉 **Your Architecture-as-Code Visualizer will be automatically deployed to the `/aac/` folder on every push to the main branch!**
