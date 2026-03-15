# Architecture-as-Code Visualizer

A modern React-based web application that transforms Infrastructure-as-Code (IaC) configurations into interactive Mermaid diagrams.

## Features

### Supported Formats

- **Docker Compose** (.yml/.yaml) - Container orchestration
- **Kubernetes** (.yml/.yaml) - Container management with multi-document support
- **Terraform** (.tf/.yml/.yaml) - Infrastructure-as-Code
- **AWS CloudFormation** (.yml/.yaml/.json) - AWS cloud resources
- **Azure ARM Templates** (.json) - Azure Resource Manager
- **IBM Cloud** (.json/.yml/.yaml) - IBM Cloud resources

### Core Features

- 📁 **Drag & Drop File Upload** with validation
- ✍️ **Live Code Editor** with syntax highlighting and format detection
- 📊 **Interactive Diagram Visualization** powered by Mermaid.js
- 🎨 **Multiple Themes** (Default, Dark, Forest, Neutral, Base)
- 📤 **Export Options** (SVG, PNG, Mermaid Code)
- 📋 **Pre-built Examples** for all supported formats
- 🌙 **Dark/Light Mode** support
- 📱 **Responsive Design** for all devices
- ⚡ **Live Validation** with error and warning display

### 🆕 New Features

- 📚 **Example Configurations** - Load pre-built examples to get started quickly
- 🚀 **FTP Deployment** - Automated GitHub Actions deployment to FTP servers
- 🔧 **Husky Pre-commit Hooks** - Automated linting and testing before commits
- 🔄 **Renovate Auto-updates** - Automated dependency updates
- 🎯 **Enhanced Theme Switching** - All themes now work correctly

## 🛠️ Technology Stack

- **Frontend:** React 19.1.1 with TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2 for fast development
- **Styling:** Tailwind CSS with PostCSS for modern UI
- **Diagrams:** Mermaid 11.12.0 for interactive visualizations
- **YAML Parsing:** js-yaml 4.1.0 for robust data processing
- **Icons:** Lucide React for consistent icons
- **Testing:** Vitest with @testing-library/react
- **Linting:** ESLint with TypeScript rules
- **Code Quality:** Husky + lint-staged for pre-commit hooks
- **Auto-updates:** Renovate for dependency management

## 📦 Installation

### Prerequisites

- Node.js (Version 18+ recommended)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd architecture-as-code-visualizer

# Install dependencies
npm install

# Start development server
npm run dev

# Application opens at http://localhost:5173
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Create production build
npm run preview    # Preview production build
npm run test       # Run tests
npm run test:run   # Run tests once
npm run test:ui    # Start test UI
npm run lint       # Run linting
npm run lint:fix   # Fix linting issues automatically
```

## 🎯 Usage

### 1. Using Example Configurations

- Browse the "Example Configurations" section
- Click "Load Example" for any pre-built configuration
- Examples available for Docker Compose, Kubernetes, and Terraform
- Copy or download examples for your own use

### 2. Upload Files

- Drag and drop a configuration file into the upload area, or
- Click to browse and select a file
- Supported formats: .yml, .yaml, .json, .tf

### 3. Edit Code

- Use the integrated editor with syntax highlighting
- Format detection happens automatically
- Real-time validation errors are displayed

### 4. View Diagrams

- Interactive Mermaid diagrams
- Zoom and pan functionality
- Fullscreen mode available
- Multiple theme options

### 5. Export

- **SVG:** Vector graphics for web and print
- **PNG:** Raster graphics for presentations
- **Mermaid Code:** Source code for further editing

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── DiagramViewer.tsx    # Mermaid diagram display
│   ├── Examples.tsx         # Example configurations
│   ├── ExportButtons.tsx    # Export functionality
│   ├── FileUpload.tsx       # Drag & drop upload
│   ├── ThemeSelector.tsx    # Theme selection
│   ├── YamlEditor.tsx       # Code editor
│   └── __tests__/           # Component tests
├── utils/                # Utility functions
│   ├── exportUtils.ts       # Export logic
│   ├── mermaidGenerator.ts  # Mermaid code generation
│   ├── themes.ts            # Theme configuration
│   └── yamlParser.ts        # YAML/JSON parsing
├── types/                # TypeScript definitions
└── __tests__/            # Global tests

public/
└── examples/             # Example configuration files
    ├── docker-compose-example.yml
    ├── kubernetes-example.yml
    └── terraform-example.tf
```

## 🚀 Deployment

### Automatic FTP Deployment

This project includes GitHub Actions for automatic FTP deployment. See [FTP_DEPLOYMENT.md](FTP_DEPLOYMENT.md) for detailed setup instructions.

#### Required GitHub Secrets:

- `FTP_SERVER` - Your FTP server hostname
- `FTP_USERNAME` - Your FTP username
- `FTP_PASSWORD` - Your FTP password

#### Deployment Process:

1. Push to `main` branch triggers deployment
2. Runs tests and linting
3. Builds the project
4. Deploys to FTP server automatically

### Manual Deployment

```bash
# Build for production
npm run build

# Upload `dist/` folder to your hosting platform
```

### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development Workflow

### Pre-commit Hooks (Husky)

The project automatically runs the following before each commit:

- ESLint with auto-fix
- Prettier formatting
- Type checking

### Continuous Integration

GitHub Actions automatically:

- Run tests on multiple Node.js versions
- Perform security audits
- Build the project
- Deploy to FTP (on main branch)

### Dependency Updates (Renovate)

Renovate automatically:

- Checks for dependency updates weekly
- Groups related packages
- Auto-merges minor and patch updates
- Creates PRs for major updates

## 🎨 Themes

The application offers 5 pre-defined themes:

1. **Default** - Light, modern design
2. **Dark** - Dark mode for better eye comfort
3. **Forest** - Green color palette
4. **Neutral** - Minimalistic grayscale
5. **Base** - Warm red tones

Themes can be switched at runtime and are stored in localStorage.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test:run

# Open test UI
npm run test:ui
```

### Test Coverage

- **Unit Tests:** Utility functions (yamlParser, mermaidGenerator)
- **Component Tests:** React components with Testing Library
- **Integration Tests:** End-to-end workflows

## 📊 Supported Diagram Types

Different Mermaid diagram types are generated based on input format:

- **Docker Compose:** Flowchart with service dependencies
- **Kubernetes:** Graph with resource relationships
- **Terraform:** Flowchart with infrastructure components
- **CloudFormation:** Graph with AWS resources
- **Azure ARM:** Flowchart with Azure services
- **IBM Cloud:** Graph with IBM Cloud resources

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint rules (automatically enforced by pre-commit hooks)
- Write tests for new features
- Document complex functions
- Use conventional commit messages

## 📋 Configuration Files

### Husky (Pre-commit hooks)

```bash
# .husky/pre-commit
npx lint-staged
```

### Lint-staged

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "git add"],
    "*.{ts,tsx,js,jsx,json,css,md}": ["prettier --write", "git add"]
  }
}
```

### Renovate (Auto-updates)

```json
{
  "extends": ["config:base"],
  "schedule": ["before 6am on monday"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
```

## 🐛 Known Issues

- Terraform HCL format requires YAML/JSON conversion
- Very large files (>5MB) may cause performance issues
- Some CloudFormation intrinsic functions may not be fully supported

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Mermaid.js** for the excellent diagram engine
- **React Team** for the robust framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons

## 📞 Support

For questions or issues:

- 🐛 **Issues:** GitHub Issues for bug reports and feature requests
- 💬 **Discussions:** GitHub Discussions for general questions
- 📖 **Documentation:** Comprehensive documentation in this README

---

**Made with ❤️ for the DevOps community**

Make your Infrastructure-as-Code visually understandable and promote better collaboration in your team!

# Architecture-as-Code Visualizer

Eine moderne React-basierte Webanwendung, die Infrastructure-as-Code (IaC) Konfigurationen in interaktive Mermaid-Diagramme umwandelt. Die Anwendung unterstützt verschiedene IaC-Formate und bietet eine benutzerfreundliche Oberfläche zum Hochladen, Bearbeiten und Visualisieren von Infrastruktur-Konfigurationen.

![Architecture-as-Code Visualizer](screenshot.png)

## 🚀 Features

### Unterstützte Formate

- **Docker Compose** (.yml/.yaml) - Container-Orchestrierung
- **Kubernetes** (.yml/.yaml) - Container-Management und Multi-Document Support
- **Terraform** (.tf/.yml/.yaml) - Infrastructure-as-Code
- **AWS CloudFormation** (.yml/.yaml/.json) - AWS Cloud Resources
- **Azure ARM Templates** (.json) - Azure Resource Manager
- **IBM Cloud** (.json/.yml/.yaml) - IBM Cloud Resources

### Kernfunktionen

- 📁 **Drag & Drop Datei-Upload** mit Validierung
- ✍️ **Live Code Editor** mit Syntax-Highlighting und Format-Erkennung
- 📊 **Interaktive Diagramm-Visualisierung** powered by Mermaid.js
- 🎨 **Multiple Themes** (Default, Dark, Forest, Neutral, Base)
- 📤 **Export-Optionen** (SVG, PNG, Mermaid Code)
- 📋 **Vordefinierte Beispiele** für alle unterstützten Formate
- 🌙 **Dark/Light Mode** Support
- 📱 **Responsive Design** für alle Geräte
- ⚡ **Live-Validierung** mit Fehler- und Warnungsanzeige

## 🛠️ Technologie-Stack

- **Frontend:** React 19.1.1 mit TypeScript 5.8.3
- **Build-Tool:** Vite 7.1.2 für schnelle Entwicklung
- **Styling:** Tailwind CSS mit PostCSS für moderne UI
- **Diagramme:** Mermaid 11.11.0 für interaktive Visualisierungen
- **YAML-Parsing:** js-yaml 4.1.0 für robuste Datenverarbeitung
- **Icons:** Lucide React für konsistente Icons
- **Testing:** Vitest mit @testing-library/react
- **Linting:** ESLint mit TypeScript-Regeln

## 📦 Installation

### Voraussetzungen

- Node.js (Version 18+ empfohlen)
- npm oder yarn

### Projekt klonen und einrichten

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Anwendung öffnet sich auf http://localhost:5173
```

### Verfügbare Scripts

```bash
npm run dev        # Entwicklungsserver starten
npm run build      # Produktions-Build erstellen
npm run preview    # Build-Vorschau anzeigen
npm run test       # Tests ausführen
npm run test:ui    # Test UI starten
npm run lint       # Code-Linting
npm run lint:fix   # Automatische Lint-Fixes
```

## 🎯 Verwendung

### 1. Datei hochladen

- Ziehen Sie eine Konfigurationsdatei in den Upload-Bereich oder
- Klicken Sie zum Durchsuchen und wählen Sie eine Datei aus
- Unterstützte Formate: .yml, .yaml, .json, .tf

### 2. Code bearbeiten

- Verwenden Sie den integrierten Editor mit Syntax-Highlighting
- Die Format-Erkennung erfolgt automatisch
- Validierungsfehler werden in Echtzeit angezeigt

### 3. Beispiele ausprobieren

- Klicken Sie auf eines der vordefinierten Beispiele
- Verfügbar für alle unterstützten Formate
- Sofortige Diagramm-Generierung

### 4. Diagramm anzeigen

- Interaktive Mermaid-Diagramme
- Zoom- und Pan-Funktionen
- Vollbild-Modus verfügbar
- Multiple Theme-Optionen

### 5. Export

- **SVG:** Vektorgrafiken für Web und Druck
- **PNG:** Rastergrafiken für Präsentationen
- **Mermaid Code:** Quellcode für weitere Bearbeitung

## 🏗️ Projekt-Struktur

```
src/
├── components/           # React-Komponenten
│   ├── DiagramViewer.tsx    # Mermaid-Diagramm-Anzeige
│   ├── ExampleButtons.tsx   # Vordefinierte Beispiele
│   ├── ExportButtons.tsx    # Export-Funktionalität
│   ├── FileUpload.tsx       # Drag & Drop Upload
│   ├── ThemeSelector.tsx    # Theme-Auswahl
│   ├── YamlEditor.tsx       # Code-Editor
│   └── __tests__/           # Komponenten-Tests
├── utils/                # Utility-Funktionen
│   ├── exportUtils.ts       # Export-Logik
│   ├── mermaidGenerator.ts  # Mermaid-Code-Generierung
│   ├── themes.ts            # Theme-Konfiguration
│   ├── yamlParser.ts        # YAML/JSON Parsing
│   └── __tests__/           # Utility-Tests
├── types/                # TypeScript-Definitionen
│   └── index.ts             # Zentrale Type-Definitionen
├── data/                 # Statische Daten
│   └── examples.ts          # Beispiel-Konfigurationen
└── __tests__/            # Globale Tests
```

## 🔧 Konfiguration

### Tailwind CSS

Die Anwendung verwendet ein vollständig anpassbares Design-System:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mermaid-bg': '#f9fafb',
        'mermaid-bg-dark': '#1f2937',
      },
      // ... weitere Anpassungen
    },
  },
};
```

### Vite Konfiguration

Optimiert für moderne Entwicklung:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

## 🧪 Testing

Das Projekt verwendet Vitest für umfassende Tests:

```bash
# Alle Tests ausführen
npm run test

# Tests im Watch-Modus
npm run test:watch

# Test-Coverage anzeigen
npm run test:coverage

# Test UI öffnen
npm run test:ui
```

### Test-Kategorien

- **Unit Tests:** Utility-Funktionen (yamlParser, mermaidGenerator)
- **Component Tests:** React-Komponenten mit Testing Library
- **Integration Tests:** End-to-End Workflows

## 🎨 Themes

Die Anwendung bietet 5 vordefinierte Themes:

1. **Default** - Helles, modernes Design
2. **Dark** - Dunkler Modus für bessere Augenschonung
3. **Forest** - Grüne Farbpalette für Natur-Liebhaber
4. **Neutral** - Minimalistische Grautöne
5. **Base** - Warme Rottöne für Akzente

Themes können zur Laufzeit gewechselt werden und werden im localStorage gespeichert.

## 📊 Unterstützte Diagramm-Typen

Je nach Input-Format werden verschiedene Mermaid-Diagramm-Typen generiert:

- **Docker Compose:** Flowchart mit Service-Dependencies
- **Kubernetes:** Graph mit Resource-Beziehungen
- **Terraform:** Flowchart mit Infrastruktur-Komponenten
- **CloudFormation:** Graph mit AWS-Resources
- **Azure ARM:** Flowchart mit Azure-Services
- **IBM Cloud:** Graph mit IBM-Cloud-Resources

## 🚀 Deployment

### Automatic FTP Deployment (GitHub Actions)

This project includes automated deployment to your FTP server via GitHub Actions:

**🔧 Setup Instructions:**

1. **Configure FTP Secrets** in GitHub repository settings:

   ```
   FTP_SERVER     = your-ftp-server.com
   FTP_USERNAME   = your-ftp-username
   FTP_PASSWORD   = your-ftp-password
   FTP_SERVER_DIR = /public_html/
   ```

2. **Set Repository Variables:**

   ```
   DEPLOYMENT_URL = https://your-domain.com
   ```

3. **Deploy automatically** on push to `main` branch!

**📋 Deployment Features:**

- ✅ **Automatic testing** and security audit
- ✅ **Bundle optimization** and analysis
- ✅ **Production & staging** environments
- ✅ **Manual deployment** triggers
- ✅ **Deployment verification** and reporting

**🧪 Test your deployment setup:**

```bash
npm run deploy:test
```

📚 **Full setup guide**: [docs/DEPLOYMENT_SETUP.md](docs/DEPLOYMENT_SETUP.md)

### Manual Hosting

#### Static Hosting

```bash
# Build für Produktion
npm run build

# Build-Ordner `dist/` auf Hosting-Plattform hochladen
```

### Docker

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel/Netlify

Das Projekt ist optimiert für statisches Hosting auf Plattformen wie Vercel oder Netlify.

## 🤝 Beitragen

Beiträge sind willkommen! Bitte befolgen Sie diese Schritte:

1. **Fork** das Repository
2. **Branch** erstellen (`git checkout -b feature/amazing-feature`)
3. **Commit** Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. **Push** zum Branch (`git push origin feature/amazing-feature`)
5. **Pull Request** öffnen

### Entwicklungsrichtlinien

- Verwenden Sie TypeScript für Type-Sicherheit
- Folgen Sie den ESLint-Regeln
- Schreiben Sie Tests für neue Features
- Dokumentieren Sie komplexe Funktionen
- Verwenden Sie konventionelle Commit-Messages

## 📋 Roadmap

### Geplante Features

- [ ] **Erweiterte Export-Optionen** (PDF, High-Resolution PNG)
- [ ] **Backend-Integration** für File-Sharing
- [ ] **Kollaborations-Features** (Real-time Editing)
- [ ] **Plugin-System** für custom Parsers
- [ ] **CLI-Tool** für Batch-Processing
- [ ] **VS Code Extension** Integration
- [ ] **Mehr IaC-Formate** (Pulumi, CDK)
- [ ] **Advanced Theming** (Custom Theme Editor)

### Verbesserungen

- [ ] **Performance-Optimierung** für große Dateien
- [ ] **Erweiterte Validierung** mit Context-aware Errors
- [ ] **Accessibility-Verbesserungen** (WCAG 2.1 AA)
- [ ] **Internationalisierung** (i18n Support)
- [ ] **Progressive Web App** Features

## 🐛 Known Issues

- Terraform HCL-Format erfordert YAML/JSON Konvertierung
- Sehr große Dateien (>5MB) können Performance-Probleme verursachen
- PDF-Export benötigt zusätzliche Browser-Berechtigungen
- Einige CloudFormation Intrinsic Functions werden möglicherweise nicht vollständig unterstützt

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- **Mermaid.js** für die excellente Diagramm-Engine
- **React Team** für das robuste Framework
- **Vite Team** für die schnelle Build-Tool
- **Tailwind CSS** für das utility-first CSS Framework
- **Lucide** für die schönen Icons

## 📞 Support

Bei Fragen oder Problemen:

- 🐛 **Issues:** GitHub Issues für Bug-Reports und Feature-Requests
- 💬 **Discussions:** GitHub Discussions für allgemeine Fragen
- 📖 **Documentation:** Umfassende Dokumentation in diesem README

---

**Erstellt mit ❤️ für die DevOps-Community**

---

**🎯 Make your Infrastructure-as-Code visually understandable and promote better collaboration in your team!**

[![Deploy Now](https://img.shields.io/badge/Deploy%20Now-🚀-success?style=for-the-badge)](https://github.com/flori950/Architecture-as-Code-Visualizer/actions/workflows/deploy.yml)
