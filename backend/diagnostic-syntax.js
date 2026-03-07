#!/usr/bin/env node
/**
 * Diagnostic script to find syntax errors in all JS files
 * Usage: node diagnostic-syntax.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const baseDir = '.';

function checkSyntax(file) {
  try {
    execSync(`node --check "${file}"`, { encoding: 'utf8' });
    return { status: 'OK', error: null };
  } catch (err) {
    return { status: 'ERROR', error: err.message };
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (file === 'node_modules') continue;
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith('.js')) {
      callback(fullPath);
    }
  }
}

console.log('🔍 Checking syntax of all JS files...\n');

let errorCount = 0;
const errors = [];

walkDir(baseDir, (file) => {
  const result = checkSyntax(file);
  if (result.status === 'ERROR') {
    errorCount++;
    errors.push({ file, error: result.error });
    console.log(`❌ ${file}`);
    console.log(`   ${result.error.split('\n')[0]}\n`);
  }
});

if (errorCount === 0) {
  console.log('✅ No syntax errors found!');
} else {
  console.log(`\n⚠️  Found ${errorCount} file(s) with syntax errors\n`);
  console.log('Files with errors:');
  errors.forEach(e => {
    console.log(`  - ${e.file}`);
  });
}

process.exit(errorCount > 0 ? 1 : 0);
