const CryptoJS = require('crypto-js');

// Clave de encriptación desde variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-this-in-production';

/**
 * Encripta un texto usando AES-256
 * @param {string} text - Texto a encriptar
 * @returns {string} Texto encriptado en base64
 */
const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Desencripta un texto encriptado con AES-256
 * @param {string} encryptedText - Texto encriptado en base64
 * @returns {string} Texto desencriptado original
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};

module.exports = { encrypt, decrypt };