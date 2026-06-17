/**
 * test.js
 * 
 * Why this file exists:
 * A simple utility test script to verify that our validator functions are functioning correctly.
 * 
 * Responsibility:
 * Runs assertions on utils/validators.js functions and reports success/failures in the console.
 * 
 * Connection to the system:
 * Completely decoupled utility. Can be executed with `node test.js` to ensure the core validation rules 
 * are functioning perfectly.
 */

const {
  validateEmail,
  validatePhone,
  validateDate,
  validatePaymentMode
} = require('./utils/validators');

// Extremely simple assert mock function
const assert = (description, condition) => {
  if (condition) {
    console.log(`✅ SUCCESS: ${description}`);
  } else {
    console.error(`❌ FAILURE: ${description}`);
    process.exitCode = 1;
  }
};

console.log('=== RUNNING FIELD VALIDATION ENGINE TESTS ===\n');

// 1. Email Validations
console.log('--- Email Tests ---');
assert('Valid standard email', validateEmail('test@example.com') === true);
assert('Valid sub-domain email', validateEmail('user.name@department.company.co') === true);
assert('Invalid email missing domain extension', validateEmail('user@domain') === false);
assert('Invalid email missing @ symbol', validateEmail('myname-domain.com') === false);
assert('Invalid email with spaces', validateEmail('user name@domain.com') === false);

// 2. Phone Validations (India vs Singapore)
console.log('\n--- Phone Tests ---');
assert('Valid India mobile (+91 prefix)', validatePhone('+919876543210', 'India') === true);
assert('Valid India mobile (91 prefix)', validatePhone('919876543210', 'India') === true);
assert('Valid India mobile (spaces/dashes)', validatePhone('+91 98765-43210', 'India') === true);
assert('Valid India mobile (no prefix, 10 digits)', validatePhone('9876543210', 'India') === true);
assert('Invalid India mobile (wrong length)', validatePhone('98765432', 'India') === false);

assert('Valid Singapore mobile (+65 prefix)', validatePhone('+6581234567', 'Singapore') === true);
assert('Valid Singapore mobile (65 prefix)', validatePhone('6581234567', 'Singapore') === true);
assert('Valid Singapore mobile (spaces)', validatePhone('+65 8123 4567', 'Singapore') === true);
assert('Valid Singapore mobile (no prefix, 8 digits)', validatePhone('81234567', 'Singapore') === true);
assert('Invalid Singapore mobile (wrong length)', validatePhone('812345678', 'Singapore') === false);

assert('Unsupported country name', validatePhone('9876543210', 'USA') === false);

// 3. Payment Mode Validations
console.log('\n--- Payment Mode Tests ---');
assert('Valid UPI check', validatePaymentMode('UPI') === true);
assert('Valid Credit Card check (case-insensitive)', validatePaymentMode('credit card') === true);
assert('Valid Net Banking check', validatePaymentMode('Net Banking') === true);
assert('Invalid Cash check', validatePaymentMode('Cash') === false);
assert('Invalid Bitcoin check', validatePaymentMode('Bitcoin') === false);

console.log('\n=== FIELD VALIDATION ENGINE TESTS COMPLETED ===');
if (process.exitCode === 1) {
  console.log('\n❌ Some test cases failed. Review code adjustments.');
} else {
  console.log('\n🏆 All validator functions passed assertions successfully!');
}
