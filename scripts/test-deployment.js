#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests deployment configuration and FTP connectivity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workflowPath = path.join(
  __dirname,
  '..',
  '.github',
  'workflows',
  'deploy.yml'
);
const docsPath = path.join(__dirname, '..', 'docs', 'DEPLOYMENT_SETUP.md');

function checkDeploymentConfig() {
  console.log('🔍 Checking deployment configuration...\n');

  // Check if workflow file exists
  if (!fs.existsSync(workflowPath)) {
    console.error('❌ Deployment workflow not found!');
    console.log('Expected: .github/workflows/deploy.yml');
    return false;
  }
  console.log('✅ Deployment workflow found');

  // Check if documentation exists
  if (!fs.existsSync(docsPath)) {
    console.error('❌ Deployment documentation not found!');
    console.log('Expected: docs/DEPLOYMENT_SETUP.md');
    return false;
  }
  console.log('✅ Deployment documentation found');

  // Check workflow content
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');

  const requiredSecrets = [
    'FTP_SERVER',
    'FTP_USERNAME',
    'FTP_PASSWORD',
    'FTP_SERVER_DIR',
  ];

  console.log('\n🔐 Checking required secrets configuration...');
  requiredSecrets.forEach(secret => {
    if (workflowContent.includes(`secrets.${secret}`)) {
      console.log(`✅ ${secret} is configured in workflow`);
    } else {
      console.log(`⚠️  ${secret} might not be properly configured`);
    }
  });

  // Check for deployment jobs
  console.log('\n🚀 Checking deployment jobs...');
  const deploymentJobs = [
    'build-and-test',
    'security-scan',
    'deploy-production',
    'deploy-staging',
  ];

  deploymentJobs.forEach(job => {
    if (workflowContent.includes(job)) {
      console.log(`✅ ${job} job configured`);
    } else {
      console.log(`❌ ${job} job missing`);
    }
  });

  return true;
}

function generateSecretsTemplate() {
  console.log('\n📋 GitHub Secrets Template');
  console.log('='.repeat(50));
  console.log(
    'Copy these to GitHub Settings → Secrets and variables → Actions:\n'
  );

  const secrets = [
    {
      name: 'FTP_SERVER',
      example: 'ftp.yourhost.com',
      description: 'Your FTP server address',
    },
    {
      name: 'FTP_USERNAME',
      example: 'username@yourdomain.com',
      description: 'FTP username',
    },
    {
      name: 'FTP_PASSWORD',
      example: 'YourSecurePassword123!',
      description: 'FTP password',
    },
    {
      name: 'FTP_SERVER_DIR',
      example: '/public_html/',
      description: 'FTP directory path',
    },
  ];

  secrets.forEach(({ name, example, description }) => {
    console.log(`Secret Name: ${name}`);
    console.log(`Description: ${description}`);
    console.log(`Example:     ${example}`);
    console.log('');
  });

  console.log('Optional Staging Secrets:');
  console.log('STAGING_FTP_SERVER     = staging.yourhost.com');
  console.log('STAGING_FTP_USERNAME   = staging-user');
  console.log('STAGING_FTP_PASSWORD   = StagingPassword123!');
  console.log('STAGING_FTP_SERVER_DIR = /staging/');
  console.log('');

  console.log('Repository Variables (Settings → Variables):');
  console.log('DEPLOYMENT_URL = https://yourdomain.com');
  console.log('STAGING_URL    = https://staging.yourdomain.com');
}

function generateDeploymentChecklist() {
  console.log('\n✅ Deployment Checklist');
  console.log('='.repeat(50));

  const checklist = [
    'Configure FTP secrets in GitHub repository settings',
    'Set DEPLOYMENT_URL variable with your domain',
    'Verify FTP server directory structure',
    'Test FTP connection with your credentials',
    'Push to main branch to trigger first deployment',
    'Check GitHub Actions for deployment status',
    'Verify website is live at your domain',
    'Test staging deployment with a pull request',
  ];

  checklist.forEach((item, index) => {
    console.log(`${index + 1}. [ ] ${item}`);
  });
}

function showDeploymentCommands() {
  console.log('\n🔧 Useful Deployment Commands');
  console.log('='.repeat(50));
  console.log('');
  console.log('Build locally:           npm run build');
  console.log('Analyze bundle:          npm run build:analyze');
  console.log('Test deployment:         node scripts/test-deployment.js');
  console.log('');
  console.log('Manual deployment trigger:');
  console.log('1. Go to GitHub Actions tab');
  console.log('2. Click "Deploy Architecture-as-Code Visualizer"');
  console.log('3. Click "Run workflow"');
  console.log('4. Select environment and run');
}

function main() {
  console.log('🚀 Architecture-as-Code Visualizer Deployment Test\n');

  const configOk = checkDeploymentConfig();

  if (configOk) {
    console.log('\n🎉 Deployment configuration looks good!');
    generateSecretsTemplate();
    generateDeploymentChecklist();
    showDeploymentCommands();

    console.log('\n📚 Next Steps:');
    console.log('1. Read docs/DEPLOYMENT_SETUP.md for detailed setup');
    console.log('2. Configure your FTP secrets in GitHub');
    console.log('3. Push to main branch to deploy!');
  } else {
    console.log('\n❌ Please fix the configuration issues above');
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error('❌ Error running deployment test:', error.message);
  process.exit(1);
}
