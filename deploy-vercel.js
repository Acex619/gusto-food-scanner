#!/usr/bin/env node

/**
 * Gusto Food Scanner Vercel Deployment Script
 * This script helps you deploy the Gusto Food Scanner app to Vercel with a custom name
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n� Gusto Food Scanner Vercel Deployment Helper �\n');

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('This script will deploy Gusto Food Scanner to Vercel with a custom name.');
  
  // Suggest some unique names
  console.log('\nSuggested project names:');
  console.log('- food-lens-scanner');
  console.log('- gusto-food-scanner');
  console.log('- eco-food-scanner');
  console.log('- food-transparency');
  
  const projectName = await question('\nEnter a unique project name: ');
  
  // Build the project first
  console.log('\n📦 Building the project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!\n');
  } catch (error) {
    console.error('❌ Build failed. Please fix the errors and try again.');
    process.exit(1);
  }
  
  console.log('🚀 Deploying to Vercel...');
  
  try {
    // Check if vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      console.log('Installing Vercel CLI...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }
    
    // Deploy to Vercel
    execSync(`vercel --name ${projectName}`, { stdio: 'inherit' });
    console.log(`\n✅ Deployed successfully! Your app should be available at: https://${projectName}.vercel.app\n`);
    
    // Update README with deployment info
    console.log(`Don't forget to update your README.md with this deployment URL: https://${projectName}.vercel.app`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
  
  rl.close();
}

main().catch(console.error);
