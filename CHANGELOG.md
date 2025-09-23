# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 📚 **Example Configurations** - Pre-built examples for Docker Compose, Kubernetes, and Terraform
  - Interactive examples section with load, copy, and download functionality
  - Real-world examples: Web application stack, microservices deployment, AWS infrastructure
  - Examples automatically included in build output for offline access

- 🚀 **FTP Deployment** - Complete GitHub Actions workflow for automated FTP deployment
  - Automated deployment to FTP servers on push to main branch
  - Comprehensive CI/CD pipeline with testing, linting, and building
  - Security-focused deployment with proper file exclusions
  - Detailed setup documentation in `FTP_DEPLOYMENT.md`

- 🔧 **Husky Pre-commit Hooks** - Automated code quality enforcement
  - ESLint with auto-fix on commit
  - Prettier formatting on commit
  - Type checking before commits
  - Prevents commits with code quality issues

- 🔄 **Renovate Auto-updates** - Automated dependency management
  - Weekly dependency update checks
  - Auto-merge for minor and patch updates
  - Grouped package updates for related dependencies
  - Security vulnerability alerts
  - Lock file maintenance

- 🎯 **Enhanced Theme Switching** - Improved theme functionality
  - Fixed theme switching logic for all themes (Default, Dark, Forest, Neutral, Base)
  - Better theme persistence and initialization
  - Improved dark mode toggle functionality
  - Consistent theme application across all components

### Changed

- 📖 **Documentation** - Completely rewritten README with comprehensive feature overview
  - Added detailed feature descriptions and usage instructions
  - Included setup instructions for all new features
  - Added contribution guidelines and development workflow
  - Enhanced project structure documentation

- 🏗️ **Development Workflow** - Improved development experience
  - Added lint-staged for staged file processing
  - Enhanced GitHub Actions with matrix testing
  - Added security scanning to CI pipeline
  - Improved error handling and user feedback

### Technical Improvements

- **Code Quality**: Enhanced ESLint configuration with better TypeScript support
- **Type Safety**: Improved type definitions and error handling
- **Performance**: Optimized build process and bundle size
- **Security**: Added security auditing to CI/CD pipeline
- **Maintainability**: Better project structure and documentation

### Files Added

- `src/components/Examples.tsx` - Example configurations component
- `public/examples/` - Directory with example configuration files
  - `docker-compose-example.yml` - Complete web application stack
  - `kubernetes-example.yml` - Microservices deployment
  - `terraform-example.tf` - AWS infrastructure setup
- `.github/workflows/deploy.yml` - FTP deployment workflow
- `.github/workflows/ci.yml` - Continuous integration workflow
- `.husky/pre-commit` - Pre-commit hook configuration
- `renovate.json` - Renovate configuration for auto-updates
- `.prettierrc` - Prettier formatting configuration
- `FTP_DEPLOYMENT.md` - FTP deployment setup guide
- `CHANGELOG.md` - This changelog file

### Dependencies Added

- `husky` - Git hooks made easy
- `lint-staged` - Run linters on staged files
- `prettier` - Code formatter

### Configuration Updates

- Enhanced `package.json` with lint-staged configuration
- Updated `tsconfig` files with consistent casing enforcement
- Improved GitHub Actions with better error handling and notifications

## [Previous Versions]

### Initial Release

- Basic React application with TypeScript
- Support for Docker Compose, Kubernetes, Terraform, CloudFormation, Azure ARM, IBM Cloud
- Drag & drop file upload functionality
- Interactive Mermaid diagram generation
- Multiple export options (SVG, PNG, Mermaid code)
- Theme support with light/dark modes
- Comprehensive testing with Vitest
- ESLint and TypeScript configuration
