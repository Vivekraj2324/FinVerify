/**
 * utils/validators.js
 * 
 * Why this file exists:
 * It houses pure utility functions responsible for validating individual fields.
 * 
 * Responsibility:
 * Centralizing data formatting check logic. Doing this outside controllers keeps 
 * business logic modular, reusable, and easy to unit test.
 * 
 * Connection to the system:
 * Imported by `services/validationService.js` to inspect specific field values of 
 * each parsed CSV row.
 */

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/**
 * Validates email format using standard RFC 5322 regex.
 * @param {string} email 
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Standard robust email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

/**
 * Validates phone numbers based on country codes and digits requirements.
 * Rules:
 * - India: Must resolve to exactly 10 digits (excluding optional country code +91 / 91 / leading 0).
 * - Singapore: Must resolve to exactly 8 digits (excluding optional country code +65 / 65).
 * 
 * @param {string} phone 
 * @param {string} country 
 * @returns {boolean}
 */
const validatePhone = (phone, country) => {
  if (!phone || typeof phone !== 'string') return false;
  if (!country || typeof country !== 'string') return false;

  // Clean the phone number by removing spaces, dashes, parentheses, and leading plus sign
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  const normCountry = country.trim().toLowerCase();

  if (normCountry === 'india') {
    // Check if it starts with 91 or 0 and strip it
    let digitsOnly = cleaned;
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      digitsOnly = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length > 10) {
      digitsOnly = cleaned.substring(1);
    }
    // Check if the result is exactly 10 digits and numbers only
    return /^\d{10}$/.test(digitsOnly);
  } 
  
  if (normCountry === 'singapore') {
    let digitsOnly = cleaned;
    if (cleaned.startsWith('65') && cleaned.length > 8) {
      digitsOnly = cleaned.substring(2);
    }
    // Check if the result is exactly 8 digits and numbers only
    return /^\d{8}$/.test(digitsOnly);
  }

  return false; // Unsupported country
};

/**
 * Validates if the date string represents a valid date.
 * Supports multiple standard ISO & common formats.
 * @param {string} dateString 
 * @returns {boolean}
 */
const validateDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;
  const trimmed = dateString.trim();

  // Try parsing multiple common formats strictly
  const formats = [
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    'YYYY/MM/DD',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
    'YYYY-MM-DDTHH:mm:ssZ',
    'YYYY-MM-DD HH:mm:ss'
  ];
  
  // dayjs(val, format, strict) returns valid only if matches exactly
  let isValid = false;
  for (const fmt of formats) {
    if (dayjs(trimmed, fmt, true).isValid()) {
      isValid = true;
      break;
    }
  }

  return isValid;
};

/**
 * Validates if the payment mode matches supported options.
 * Supported: Credit Card, Debit Card, Net Banking, UPI, Wallet (case-insensitive)
 * @param {string} mode 
 * @returns {boolean}
 */
const validatePaymentMode = (mode) => {
  if (!mode || typeof mode !== 'string') return false;
  
  const allowedModes = ['credit card', 'debit card', 'net banking', 'upi', 'wallet'];
  return allowedModes.includes(mode.trim().toLowerCase());
};

module.exports = {
  validateEmail,
  validatePhone,
  validateDate,
  validatePaymentMode
};
