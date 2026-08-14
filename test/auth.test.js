const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAdminPassword, ADMIN_PASSWORD } = require('../src/auth');

test('la contraseña administrativa debe ser la establecida por el cliente', () => {
  assert.equal(ADMIN_PASSWORD, 'Admin#GPON7');
  assert.equal(validateAdminPassword('Admin#GPON7'), true);
  assert.equal(validateAdminPassword('otra-clave'), false);
});
