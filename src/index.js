import { extractEmails, getValidEmails } from './email.js';

const users = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Jim', email: 'jim@example.com' },
];

const emails = extractEmails(users);
console.log(emails);

const validEmails = getValidEmails(users);
console.log(validEmails);
