import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';
const randEmail = `test_success_${crypto.randomBytes(4).toString('hex')}@example.com`;
const password = 'TestPassword123!';
const logLines = [];

function log(msg, obj = undefined) {
  const line = obj ? `${msg} ${JSON.stringify(obj)}` : msg;
  console.log(line);
  logLines.push(line);
}

async function smokeTest() {
  try {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randEmail, password })
    });
    
    // verify email by reading it from DB directly
    const dbPath = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const user = users.find(u => u.email === randEmail);
    
    await fetch(`${API_URL}/auth/verify-email?token=${user.verificationToken}`);
    
    // log in
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randEmail, password })
    });
    const loginData = await loginRes.json();
    log(`Login response: ${loginRes.status}`, loginData);
    
    const tradeSuccessRes = await fetch(`${API_URL}/trade`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ action: "BUY", side: "long", asset: "ETH", amount: 100 })
    });
    const tradeText = await tradeSuccessRes.text();
    log(`Trade with legitimate token: ${tradeSuccessRes.status}`, tradeText);
    
  } catch (err) {
    log(`Error: ${err.message}`);
  } finally {
    fs.writeFileSync('test_success_results.json', JSON.stringify({ log: logLines }, null, 2), 'utf8');
  }
}

smokeTest();
