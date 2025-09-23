# 🚀 FTP Deployment Configuration Guide

This guide helps you configure GitHub Actions for automatic deployment to your FTP server.

## 🔐 Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Production FTP Secrets (Required)

```
FTP_SERVER         = your-ftp-server.com
FTP_USERNAME       = your-ftp-username
FTP_PASSWORD       = your-ftp-password
FTP_SERVER_DIR     = /public_html/  (or your web root directory)
```

### Staging FTP Secrets (Optional - for staging deployments)

```
STAGING_FTP_SERVER     = staging-server.com (optional, uses production server if not set)
STAGING_FTP_USERNAME   = staging-username (optional, uses production username if not set)
STAGING_FTP_PASSWORD   = staging-password (optional, uses production password if not set)
STAGING_FTP_SERVER_DIR = /staging/ (optional, defaults to /staging/)
```

## 🌐 Repository Variables

Configure these variables in your GitHub repository settings > Variables:

### Production Variables

```
DEPLOYMENT_URL = https://your-domain.com
```

### Staging Variables

```
STAGING_URL = https://staging.your-domain.com
```

## 📋 How to Set Up Secrets

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Click**: "New repository secret"
4. **Add each secret** with the exact names listed above

### Example FTP Configuration:

```
FTP_SERVER = ftp.example.com
FTP_USERNAME = mywebsite@example.com
FTP_PASSWORD = MySecurePassword123!
FTP_SERVER_DIR = /public_html/
DEPLOYMENT_URL = https://example.com
```

## 🏗️ Deployment Workflow

### Automatic Deployments

- **Production**: Triggered on push to `main` or `master` branch
- **Staging**: Triggered on pull requests

### Manual Deployments

- Go to Actions → Deploy Architecture-as-Code Visualizer → Run workflow
- Choose environment (production/staging)
- Option to skip tests for emergency deployments

## 📁 FTP Directory Structure

Your FTP server should have this structure:

```
/public_html/               ← Production deployment
    index.html
    assets/
    js/
    examples/
    sw.js
    ...

/staging/                   ← Staging deployment (optional)
    index.html
    assets/
    js/
    ...
```

## 🔒 Security Best Practices

1. **Use strong FTP passwords** with special characters
2. **Enable FTP over SSL/TLS** if your host supports it
3. **Create dedicated FTP user** with minimal permissions
4. **Regularly rotate FTP passwords**
5. **Use staging environment** for testing before production

## 🚀 Deployment Features

### ✅ What the workflow does:

- **Builds and tests** your application
- **Performs security audit** of dependencies
- **Analyzes bundle size** and reports optimizations
- **Deploys to FTP server** with proper file exclusions
- **Verifies deployment** and provides status updates
- **Creates deployment summaries** with links and metrics

### 📊 Bundle Analysis

- Pre and post-build size analysis
- Automatic bundle optimization reporting
- Performance recommendations

### 🧪 Staging Environment

- Test deployments for pull requests
- Staging indicator in the title and HTML
- Separate FTP directory for safe testing

## 🔧 Troubleshooting

### Common Issues:

1. **FTP Connection Failed**
   - Verify FTP server address and port
   - Check if your host requires FTPS/SFTP
   - Ensure firewall allows FTP connections

2. **Permission Denied**
   - Verify FTP username and password
   - Check directory permissions on server
   - Ensure FTP user has write access to target directory

3. **Files Not Uploading**
   - Check FTP_SERVER_DIR path (must start and end with /)
   - Verify directory exists on server
   - Check file size limits

4. **Website Not Loading**
   - Verify DEPLOYMENT_URL points to correct domain
   - Check if index.html is in the right directory
   - Ensure server is serving files correctly

### Debug Mode:

The workflow includes verbose logging. Check the GitHub Actions logs for detailed deployment information.

## 📞 Support

If you encounter issues:

1. Check the **Actions tab** for detailed logs
2. Verify all **secrets are correctly set**
3. Test FTP connection with **FTP client** first
4. Check your **hosting provider's documentation**

## 🎯 Next Steps

1. **Configure your FTP secrets** in GitHub
2. **Set your domain URL** in repository variables
3. **Push to main branch** to trigger first deployment
4. **Verify your site** is live and working
5. **Create a pull request** to test staging deployment

Your Architecture-as-Code Visualizer will be automatically deployed with every push! 🚀
