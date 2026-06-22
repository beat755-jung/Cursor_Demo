import { extractEmails, getValidEmails, uniqueValidEmails } from './email.js';

const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'invalid-email' },
  { name: 'Carol', email: 'carol@test.org' },
  { name: 'Dave', email: 'alice@example.com' },
];

console.log('전체 이메일:', extractEmails(users));
console.log('유효 이메일:', getValidEmails(users));
console.log('유효·중복 제거:', uniqueValidEmails(users));
