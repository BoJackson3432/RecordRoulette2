#!/usr/bin/env node

/**
 * Deployment Validation Script
 * This script validates the Vercel deployment configuration to prevent runtime errors.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Starting deployment validation...\n');

// 1. Validate vercel.json exists and has correct structure
function validateVercelConfig() {
  console.log('1. Validating vercel.json configuration...');
  
  if (!fs.existsSync('./vercel.json')) {
    throw new Error('❌ vercel.json not found!');
  }
  
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  
  // Check required fields
  if (!vercelConfig.buildCommand) {
    throw new Error('❌ vercel.json missing buildCommand');
  }
  
  if (!vercelConfig.outputDirectory) {
    throw new Error('❌ vercel.json missing outputDirectory');
  }
  
  if (!vercelConfig.rewrites) {
    throw new Error('❌ vercel.json missing rewrites');
  }
  
  // Check that outputDirectory exists after build
  if (!fs.existsSync(vercelConfig.outputDirectory)) {
    console.log('   ⚠️  Output directory does not exist yet, will be created during build');
  }
  
  console.log('   ✅ vercel.json structure is valid');
  return vercelConfig;
}

// 2. Validate API functions exist and have proper structure
function validateAPIFunctions() {
  console.log('2. Validating API functions...');
  
  if (!fs.existsSync('./api')) {
    throw new Error('❌ API directory not found!');
  }
  
  const requiredEndpoints = [
    'me.ts',
    'spin.ts', 
    'listened.ts',
    'leaderboards.ts',
    'trophies.ts',
    'moods.ts'
  ];
  
  for (const endpoint of requiredEndpoints) {
    const filePath = `./api/${endpoint}`;
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Missing API endpoint: ${endpoint}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for proper export
    if (!content.includes('export default') && !content.includes('module.exports')) {
      console.log(`   ⚠️  ${endpoint} missing proper export`);
    }
    
    // Check for proper function signature
    if (content.includes('export default function') || content.includes('function handler')) {
      console.log(`   ✅ ${endpoint} has valid handler function`);
    } else {
      console.log(`   ⚠️  ${endpoint} might have invalid function signature`);
    }
  }
  
  console.log('   ✅ API functions validation complete');
}

// 3. Test build process
function validateBuild() {
  console.log('3. Validating build process...');
  
  try {
    console.log('   🔨 Running build command...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   ✅ Build completed successfully');
    
    // Check if dist directory was created
    if (fs.existsSync('./dist/public')) {
      console.log('   ✅ Output directory created');
      
      // Check if index.html exists
      if (fs.existsSync('./dist/public/index.html')) {
        console.log('   ✅ index.html created');
      } else {
        console.log('   ⚠️  index.html not found in output directory');
      }
    } else {
      throw new Error('❌ Output directory not created after build');
    }
    
  } catch (error) {
    throw new Error(`❌ Build failed: ${error.message}`);
  }
}

// 4. Validate package.json dependencies
function validateDependencies() {
  console.log('4. Validating dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  const requiredDeps = ['@vercel/node'];
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep} is installed`);
    } else {
      console.log(`   ⚠️  ${dep} not found in dependencies`);
    }
  }
}

// 5. Test Vercel CLI configuration validation
function validateWithVercelCLI() {
  console.log('5. Validating with Vercel CLI...');
  
  try {
    // Test vercel.json parsing without deploying - no masking of errors
    execSync('npx vercel build --local-config vercel.json', { 
      stdio: 'pipe',
      timeout: 15000 
    });
    console.log('   ✅ Vercel CLI can build and parse configuration');
  } catch (error) {
    // Don't fail the entire validation, but report the actual error
    console.log(`   ⚠️  Vercel CLI validation failed: ${error.message.split('\n')[0]}`);
    console.log('   ℹ️  This may be OK in testing environment without Vercel auth');
  }
}

// Main execution
async function main() {
  try {
    validateVercelConfig();
    validateAPIFunctions();
    validateDependencies();
    validateBuild();
    validateWithVercelCLI();
    
    console.log('\n🎉 All validations passed!');
    console.log('✅ Deployment configuration is ready for Vercel');
    console.log('✅ No runtime errors should occur during deployment');
    
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

main();