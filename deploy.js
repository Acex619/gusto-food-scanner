#!/usr/bin/env node

/**
 * Gusto Food Scanner Deployment Script
 * This script helps you deploy the Gusto Food Scanner app to various platforms
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n� Gusto Food Scanner Deployment Helper �\n');

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('This script will help you deploy Gusto Food Scanner online for 24/7 free testing.');
  
  const platform = await question(
    '\nWhere would you like to deploy?\n' +
    '1. Vercel (Recommended for React apps)\n' +
    '2. Netlify\n' +
    '3. GitHub Pages\n' +
    'Choose an option (1-3): '
  );
  
  // Build the project first
  console.log('\n📦 Building the project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!\n');
  } catch (error) {
    console.error('❌ Build failed. Please fix the errors and try again.');
    process.exit(1);
  }
  
  switch (platform) {
    case '1': {
      console.log('🚀 Deploying to Vercel...');
      
      const projectName = await question('Enter a unique project name (e.g., gusto-food-scanner): ');
      
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
      } catch (error) {
        console.error('❌ Deployment failed:', error.message);
      }
      break;
    }
    
    case '2': {
      console.log('🚀 Deploying to Netlify...');
      
      try {
        // Check if netlify CLI is installed
        try {
          execSync('netlify --version', { stdio: 'ignore' });
        } catch {
          console.log('Installing Netlify CLI...');
          execSync('npm install -g netlify-cli', { stdio: 'inherit' });
        }
        
        // Deploy to Netlify
        console.log('Creating a draft deployment...');
        execSync('netlify deploy', { stdio: 'inherit' });
        
        const toProd = await question('\nDeploy to production? (y/n): ');
        if (toProd.toLowerCase() === 'y') {
          console.log('Deploying to production...');
          execSync('netlify deploy --prod', { stdio: 'inherit' });
        }
        
        console.log('✅ Deployment completed!');
      } catch (error) {
        console.error('❌ Deployment failed:', error.message);
      }
      break;
    }
    
    case '3': {
      console.log('🚀 Deploying to GitHub Pages...');
      
      // Update package.json with GitHub Pages config
      const pkgPath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      
      const username = await question('Enter your GitHub username: ');
      const repoName = await question('Enter the repository name (e.g., eco-ai-food-lens): ');
      
      pkg.homepage = `https://${username}.github.io/${repoName}`;
      
      if (!pkg.scripts.predeploy) {
        pkg.scripts.predeploy = 'npm run build';
      }
      if (!pkg.scripts.deploy) {
        pkg.scripts.deploy = 'gh-pages -d dist';
      }
      
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      
      try {
        // Check if gh-pages is installed
        try {
          execSync('npm list gh-pages', { stdio: 'ignore' });
        } catch {
          console.log('Installing gh-pages package...');
          execSync('npm install --save-dev gh-pages', { stdio: 'inherit' });
        }
        
        // Deploy to GitHub Pages
        execSync('npm run deploy', { stdio: 'inherit' });
        console.log(`\n✅ Deployed successfully! Your app should be available at: ${pkg.homepage}\n`);
      } catch (error) {
        console.error('❌ Deployment failed:', error.message);
      }
      break;
    }
    
    default:
      console.log('Invalid option selected.');
      break;
  }
  
  rl.close();
}

main().catch(console.error);
