// verify_logic.js (Temporary verification script)
const LEVELS = require('./backend/config/levels');

console.log('--- Testing Level Config ---');
console.log('LEVELS:', LEVELS);

const testUser = {
    accountBalance: 156.50,
    level: 'Beginner',
    totalReviewsAssigned: 33,
    reviewsCompleted: 10,
    specialReviews: [
        { position: 15, negativeAmount: 409, productId: 'some_id' }
    ]
};

console.log('\n--- Testing Special Review Pricing ---');
const specialReview = testUser.specialReviews[0];
const calculatedPrice = testUser.accountBalance + specialReview.negativeAmount;
console.log(`Current Balance: ${testUser.accountBalance}`);
console.log(`Target Negative: -${specialReview.negativeAmount}`);
console.log(`Calculated Product Price: ${calculatedPrice}`);
console.log(`Verification: ${testUser.accountBalance - calculatedPrice} (Should be -${specialReview.negativeAmount})`);

console.log('\n--- Testing Level-based Commission (Beginner) ---');
const beginnerConfig = LEVELS['Beginner'];
const normalComm = (beginnerConfig.normalCommission / 100) * 100;
const specialComm = (beginnerConfig.specialCommission / 100) * calculatedPrice;
console.log(`Normal Comm (100.00 product): ${normalComm.toFixed(2)} (Expected: 0.60)`);
console.log(`Special Comm (${calculatedPrice.toFixed(2)} product): ${specialComm.toFixed(2)} (Expected: ${(0.2 * calculatedPrice).toFixed(2)})`);

console.log('\n--- Testing Commission (Proficient) ---');
const proficientConfig = LEVELS['Proficient'];
const profNormalComm = (proficientConfig.normalCommission / 100) * 100;
const profSpecialComm = (proficientConfig.specialCommission / 100) * calculatedPrice;
console.log(`Normal Comm (100.00 product): ${profNormalComm.toFixed(2)} (Expected: 1.30)`);
console.log(`Special Comm (${calculatedPrice.toFixed(2)} product): ${profSpecialComm.toFixed(2)} (Expected: ${(0.28 * calculatedPrice).toFixed(2)})`);

console.log('\n--- Testing Commission (Authority) ---');
const authorityConfig = LEVELS['Authority'];
const authNormalComm = (authorityConfig.normalCommission / 100) * 100;
const authSpecialComm = (authorityConfig.specialCommission / 100) * calculatedPrice;
console.log(`Normal Comm (100.00 product): ${authNormalComm.toFixed(2)} (Expected: 2.50)`);
console.log(`Special Comm (${calculatedPrice.toFixed(2)} product): ${authSpecialComm.toFixed(2)} (Expected: ${(0.35 * calculatedPrice).toFixed(2)})`);
