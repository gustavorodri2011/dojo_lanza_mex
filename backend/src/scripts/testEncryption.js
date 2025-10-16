const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { encrypt, decrypt } = require('../utils/encryption');

console.log('🔐 Testing encryption...');
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? 'SET' : 'NOT SET');

const testText = 'Juan Pérez';
console.log('Original:', testText);

const encrypted = encrypt(testText);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);

console.log('✅ Test completed');