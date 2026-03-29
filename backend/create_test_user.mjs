import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';
const email = `smoke@example.com`;
const password = `Password123!`;

async function createAndVerify() {
    try {
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const dbPath = path.join(process.cwd(), 'data', 'users.json');
        const users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const user = users.find(u => u.email === email);
        if(user) {
            await fetch(`${API_URL}/auth/verify-email?token=${user.verificationToken}`);
            console.log('User created and verified successfully. Email:', email, 'Password:', password);
        } else {
            console.log('User already exists or could not be found.');
            // Just force it to be verified in DB if already exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
               existingUser.isVerified = true;
               existingUser.lockoutUntil = 0;
               existingUser.failedAttempts = 0;
               fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
               console.log('User was existing, forcefully verified and unlocked.');
            }
        }
    } catch(err) {
        console.error(err);
    }
}
createAndVerify();
