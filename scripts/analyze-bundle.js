#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the build output and provides insights on bundle sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('🔍 Analyzing bundle...\n');

  const files = [];
  const scanDir = (dir, basePath = '') => {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else {
        files.push({
          path: relativePath,
          size: stats.size,
          ext: path.extname(item),
        });
      }
    }
  };

  scanDir(distDir);

  // Categorize files
  const categories = {
    'JavaScript Chunks': files.filter(
      f => f.ext === '.js' && f.path.includes('js/')
    ),
    'Main Assets': files.filter(f =>
      ['index.html', 'index.css', 'index.js'].some(name =>
        f.path.includes(name)
      )
    ),
    CSS: files.filter(f => f.ext === '.css'),
    Images: files.filter(f =>
      ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(f.ext)
    ),
    Other: files.filter(
      f =>
        !['JavaScript Chunks', 'Main Assets', 'CSS', 'Images'].some(cat => {
          switch (cat) {
            case 'JavaScript Chunks':
              return f.ext === '.js' && f.path.includes('js/');
            case 'Main Assets':
              return ['index.html', 'index.css', 'index.js'].some(name =>
                f.path.includes(name)
              );
            case 'CSS':
              return f.ext === '.css';
            case 'Images':
              return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(
                f.ext
              );
            default:
              return false;
          }
        })
    ),
  };

  let totalSize = 0;

  for (const [category, categoryFiles] of Object.entries(categories)) {
    if (categoryFiles.length === 0) continue;

    console.log(`📦 ${category}:`);

    // Sort by size (largest first)
    categoryFiles.sort((a, b) => b.size - a.size);

    let categoryTotal = 0;
    for (const file of categoryFiles) {
      console.log(
        `   ${file.path.padEnd(40)} ${formatBytes(file.size).padStart(10)}`
      );
      categoryTotal += file.size;
      totalSize += file.size;
    }

    if (categoryFiles.length > 1) {
      console.log(
        `   ${'Total'.padEnd(40)} ${formatBytes(categoryTotal).padStart(10)}`
      );
    }
    console.log();
  }

  console.log(`📊 Total Bundle Size: ${formatBytes(totalSize)}`);

  // Analyze JavaScript chunks specifically
  const jsChunks = categories['JavaScript Chunks'];
  if (jsChunks.length > 0) {
    console.log('\n🔍 JavaScript Chunk Analysis:');

    const largeChunks = jsChunks.filter(f => f.size > 500 * 1024); // > 500KB
    const mediumChunks = jsChunks.filter(
      f => f.size > 100 * 1024 && f.size <= 500 * 1024
    ); // 100KB - 500KB
    const smallChunks = jsChunks.filter(f => f.size <= 100 * 1024); // <= 100KB

    console.log(`   Large chunks (>500KB): ${largeChunks.length}`);
    console.log(`   Medium chunks (100KB-500KB): ${mediumChunks.length}`);
    console.log(`   Small chunks (≤100KB): ${smallChunks.length}`);

    if (largeChunks.length > 0) {
      console.log(
        '\n⚠️  Large chunks that might benefit from further splitting:'
      );
      largeChunks.forEach(chunk => {
        console.log(`   ${chunk.path} - ${formatBytes(chunk.size)}`);
      });
    }
  }

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  const totalJs = jsChunks.reduce((sum, f) => sum + f.size, 0);
  const totalCss = categories['CSS'].reduce((sum, f) => sum + f.size, 0);

  if (totalJs > 1024 * 1024) {
    // > 1MB
    console.log('   ⚠️  Total JavaScript size is large. Consider:');
    console.log('      - Using dynamic imports for non-critical features');
    console.log('      - Implementing route-based code splitting');
    console.log('      - Tree-shaking unused dependencies');
  } else {
    console.log('   ✅ JavaScript bundle size looks good');
  }

  if (totalCss > 100 * 1024) {
    // > 100KB
    console.log(
      '   ⚠️  CSS size is getting large. Consider CSS splitting or purging'
    );
  } else {
    console.log('   ✅ CSS bundle size looks good');
  }

  const avgChunkSize = totalJs / jsChunks.length;
  if (avgChunkSize > 300 * 1024) {
    // > 300KB average
    console.log(
      '   ⚠️  Average chunk size is large. Consider more granular chunking'
    );
  } else {
    console.log('   ✅ Chunk sizes are well balanced');
  }

  console.log('\n🎯 Bundle optimization completed!');
}

try {
  analyzeBundle();
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}
