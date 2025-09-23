# FTP Deployment Setup

This project includes automated FTP deployment via GitHub Actions. To enable FTP deployment, you need to configure the following secrets in your GitHub repository.

## Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### FTP_SERVER

Your FTP server hostname or IP address

```
Example: ftp.yourdomain.com or 192.168.1.100
```

### FTP_USERNAME

Your FTP username

```
Example: your-ftp-username
```

### FTP_PASSWORD

Your FTP password

```
Example: your-secure-password
```

## Deployment Process

The deployment workflow (`deploy.yml`) will:

1. **Test Phase**: Run linting, tests, and build on every push/PR
2. **Deploy Phase**: Only runs on pushes to `main` branch
   - Builds the project
   - Uploads the `dist/` folder to your FTP server's `/public_html/` directory
   - Excludes unnecessary files (git, node_modules, source files, etc.)

## Directory Structure on FTP Server

```
/public_html/
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── [other assets]
└── examples/
    ├── docker-compose-example.yml
    ├── kubernetes-example.yml
    └── terraform-example.tf
```

## Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# Upload the dist/ folder contents to your FTP server's public directory
# Use your preferred FTP client (FileZilla, WinSCP, etc.)
```

## Troubleshooting

### Common Issues

1. **FTP Connection Failed**: Check your FTP credentials and server settings
2. **Permission Denied**: Ensure your FTP user has write permissions to the target directory
3. **Path Issues**: Verify the `server-dir` in the workflow matches your hosting setup

### Testing FTP Deployment

You can test the deployment by:

1. Creating a test branch
2. Modifying the workflow to use the test branch
3. Setting `dry-run: true` in the FTP deploy action
4. Checking the logs to see what would be deployed

### Alternative Hosting Options

If you prefer other deployment methods, consider:

- **Netlify**: Add `netlify.toml` configuration
- **Vercel**: Zero-config deployment for React apps
- **GitHub Pages**: Use the gh-pages action
- **AWS S3**: Use AWS S3 sync action

## Security Notes

- Never commit FTP credentials to your repository
- Use strong passwords for FTP accounts
- Consider using SFTP instead of FTP for better security
- Regularly rotate your FTP passwords
- Limit FTP user permissions to only what's necessary
