import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractEmails, isValidEmail, getValidEmails, normalizeEmail } from './email.js';

test('extractEmails returns emails from users', () => {
  const users = [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ];
  assert.deepEqual(extractEmails(users), [
    'john@example.com',
    'jane@example.com',
  ]);
});

test('extractEmails returns empty array for non-array input', () => {
  assert.deepEqual(extractEmails(null), []);
});

test('isValidEmail validates email format with HTML5/WHATWG pattern', () => {
  assert.equal(isValidEmail('john@example.com'), true);
  assert.equal(isValidEmail('user.name+tag@gmail.com'), true);
  assert.equal(isValidEmail('  jane@example.com  '), true);
  assert.equal(isValidEmail('invalid'), false);
  assert.equal(isValidEmail('@no-local.com'), false);
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail(null), false);
});

test('getValidEmails filters out invalid emails', () => {
  const users = [
    { name: 'John', email: 'john@example.com' },
    { name: 'Bad', email: 'not-an-email' },
    { name: 'Jane', email: 'jane@example.com' },
    { name: 'Empty', email: '' },
    { name: 'Missing', email: undefined },
    { name: 'Whitespace', email: '   ' },
    { name: 'NoAt', email: 'missing-at-sign' },
  ];
  assert.deepEqual(getValidEmails(users), [
    'john@example.com',
    'jane@example.com',
  ]);
});

test('normalizeEmail trims whitespace and lowercases', () => {
  assert.equal(normalizeEmail('  John@Example.COM  '), 'john@example.com');
  assert.equal(normalizeEmail('jane@example.com'), 'jane@example.com');
  assert.equal(normalizeEmail(''), null);
  assert.equal(normalizeEmail('   '), null);
  assert.equal(normalizeEmail(null), null);
});
