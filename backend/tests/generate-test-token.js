#!/usr/bin/env node

/**
 * Helper script to generate Firebase ID tokens for testing
 * 
 * Usage: node generate-test-token.js
 */

const axios = require('axios');
const readline = require('readline');
const colors = require('colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Firebase Test Token Generator\n'.cyan);

// Firebase Auth REST API endpoint
const FIREBASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

// Function to get user input
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function generateToken() {
  try {
    // Get Firebase project API key
    const apiKey = await question('Enter your Firebase Web API Key: ');
    
    // Get test user credentials
    const email = await question('Enter test user email: ');
    const password = await question('Enter test user password: ');
    
    console.log('\n🔄 Authenticating with Firebase...\n');
    
    // Make request to Firebase Auth
    const response = await axios.post(`${FIREBASE_AUTH_URL}?key=${apiKey}`, {
      email,
      password,
      returnSecureToken: true
    });
    
    const { idToken, refreshToken, expiresIn } = response.data;
    
    console.log('✅ Success! Here are your tokens:\n'.green);
    console.log('ID Token (use this for API calls):'.yellow);
    console.log('━'.repeat(80).gray);
    console.log(idToken.cyan);
    console.log('━'.repeat(80).gray);
    
    console.log('\nRefresh Token (use to get new ID tokens):'.yellow);
    console.log('━'.repeat(80).gray);
    console.log(refreshToken.cyan);
    console.log('━'.repeat(80).gray);
    
    console.log(`\nToken expires in: ${expiresIn} seconds (${(expiresIn / 3600).toFixed(1)} hours)`.yellow);
    
    console.log('\n📋 Quick Usage Examples:\n'.green);
    console.log('1. Set as environment variable:'.gray);
    console.log(`   export FIREBASE_TOKEN="${idToken.substring(0, 50)}..."`);
    
    console.log('\n2. Use with curl:'.gray);
    console.log(`   curl -H "Authorization: Bearer ${idToken.substring(0, 50)}..." \\`);
    console.log('        http://localhost:5000/adv_part_2a_data/123456');
    
    console.log('\n3. Use with the test script:'.gray);
    console.log(`   FIREBASE_TOKEN="${idToken.substring(0, 50)}..." node api-test-script.js`);
    
  } catch (error) {
    console.error('\n❌ Error generating token:'.red);
    
    if (error.response) {
      const errorData = error.response.data.error;
      console.error(`${errorData.message}`.red);
      
      if (errorData.code === 'INVALID_PASSWORD') {
        console.log('\n💡 Tip: Make sure the password is correct'.yellow);
      } else if (errorData.code === 'EMAIL_NOT_FOUND') {
        console.log('\n💡 Tip: Make sure the user exists in your Firebase project'.yellow);
      } else if (errorData.code === 'USER_DISABLED') {
        console.log('\n💡 Tip: The user account has been disabled'.yellow);
      }
    } else {
      console.error(error.message.red);
    }
  } finally {
    rl.close();
  }
}

// Instructions
console.log('This script helps you generate Firebase ID tokens for testing.\n');
console.log('Prerequisites:'.yellow);
console.log('1. A Firebase project with Authentication enabled');
console.log('2. A test user account created in Firebase Console');
console.log('3. Your Firebase Web API Key (found in Project Settings)\n');

console.log('To find your Web API Key:'.gray);
console.log('1. Go to Firebase Console > Project Settings');
console.log('2. Look under "General" tab > "Web API Key"\n');

// Run the generator
generateToken();