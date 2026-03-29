import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';
const randEmail = `test_${crypto.randomBytes(4).toString('hex')}@example.com`;
const password = 'TestPassword123!';
const logLines = [];

function log(msg, obj = undefined) {
  const line = obj ? `${msg} ${JSON.stringify(obj)}` : msg;
  console.log(line);
  logLines.push(line);
}

async function smokeTest() {
  log(`Starting smoke test for ${randEmail}`);
  try {
    log('--- Registering User ---');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randEmail, password })
    });
    log(`Register response: ${registerRes.status}`, await registerRes.json());
    
    const dbPath = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const user = users.find(u => u.email === randEmail);
    if (!user) throw new Error("User not found in DB");
    
    log('--- Verifying Email ---');
    const verifyRes = await fetch(`${API_URL}/auth/verify-email?token=${user.verificationToken}`);
    log(`Verify response: ${verifyRes.status}`, await verifyRes.json());
    
    log('--- Testing Brute Force Protection (5 fails) ---');
    for (let i = 1; i <= 5; i++) {
      const loginFailRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: randEmail, password: 'WrongPassword' })
      });
      log(`Failed login attempt ${i}: ${loginFailRes.status}`, await loginFailRes.json());
    }
    
    log('--- Testing Locked Account ---');
    const lockedRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randEmail, password })
    });
    log(`Locked login response: ${lockedRes.status}`, await lockedRes.json());
    
    // reset lockout
    user.lockoutUntil = 0;
    user.failedAttempts = 0;
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
    
    log('--- Testing Successful Login ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randEmail, password })
    });
    const loginData = await loginRes.json();
    log(`Login response: ${loginRes.status}`, loginData);
    const token = loginData.token;
    
    log('--- Testing Protected Route (Trade) without Token ---');
    const tradeFailRes = await fetch(`${API_URL}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: "BTC", amount: 100, action: "mock" })
    });
    log(`Trade without token: ${tradeFailRes.status}`, await tradeFailRes.text());
    
    log('--- Testing Protected Route (Trade) with Token ---');
    const tradeSuccessRes = await fetch(`${API_URL}/trade`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: "BTC", amount: "10", action: "BUY" })
    });
    log(`Trade with token: ${tradeSuccessRes.status}`, await tradeSuccessRes.text());
    
  } catch (err) {
    log(`Error: ${err.message}`);
  } finally {
    fs.writeFileSync('smoke_test_results.json', JSON.stringify({ log: logLines }, null, 2), 'utf8');
  }
}

smokeTest();
