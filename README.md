# Architecture-as-Code Visualizer

Transform Infrastructure-as-Code (IaC) configurations into interactive Mermaid diagrams.

## Features

### Supported Formats

- Docker Compose
- Kubernetes
- Terraform
- AWS CloudFormation
- Azure ARM Templates
- IBM Cloud

### Capabilities

- Drag and drop file upload
- Live code editor with syntax highlighting
- Interactive diagram visualization
- Multiple themes (5 pre-built options)
- Export to SVG, PNG, or Mermaid code
- Pre-built example configurations
- Dark and Light mode
- Responsive design

## Technology Stack

- React 19 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Mermaid for diagram generation
- Vitest for testing
- ESLint and Prettier for code quality

## Installation

Prerequisites: Node.js 18+

```bash
npm install
npm run dev
```

The application runs at http://localhost:5173

## Available Commands

```bash
npm run dev        Start development server
npm run build      Build for production
npm run preview    Preview production build
npm run test:run   Run all tests
npm run test:ui    Run tests with UI
npm run lint       Check code quality
npm run lint:fix   Fix code issues
```

## Usage

1. Upload a configuration file via drag and drop
2. Format is detected automatically
3. Interactive diagram is generated
4. Use zoom and pan controls
5. Export in your preferred format

## Project Structure

```
src/
  components/     React components
  utils/         Utility functions
  types/         TypeScript definitions
  data/          Static data
  __tests__/     Tests
```

## Testing

All tests pass: 70/70 successful

```bash
npm run test:run
```

## Deployment

Build for production:

```bash
npm run build
```

The dist/ folder is ready for deployment.

### Docker Example

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

## Development

- ESLint enforces code standards
- Prettier formats code automatically
- TypeScript ensures type safety
- Pre-commit hooks run quality checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT - See LICENSE file for details

## Support

For issues and questions, use GitHub Issues.
