const crypto = require('crypto');

const ADMIN_PASSWORD = 'Admin#GPON7';

function validateAdminPassword(input) {
  const candidate = Buffer.from(String(input || ''));
  const expected = Buffer.from(ADMIN_PASSWORD);

  if (candidate.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidate, expected);
}

module.exports = {
  ADMIN_PASSWORD,
  validateAdminPassword,
};
