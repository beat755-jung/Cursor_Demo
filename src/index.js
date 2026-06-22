"console.log('hello cursor');" 

function extractEmails(users) {
    if (!Array.isArray(users)) {
      return [];
    }
    return users.map(user => user.email);
  }
// 사용자 배열에서 이메일만 추출하는 함수
function isValidEmail(email) {
    // 간단한 이메일 형식 검증 정규표현식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
  const users = [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
    { name: 'Jim', email: 'jim@example.com' },
  ];
  const emails = extractEmails(users);
  console.log(emails);
  // 출력: ['john@example.com', 'jane@example.com', 'jim@example.com']
  // 사용자 배열에서 이메일만 추출하는 함수
function extractEmails(users) {
    return users.map(user => user.email);
  }
  const users = [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
    { name: 'Jim', email: 'jim@example.com' },
  ];
  const emails = extractEmails(users);
  console.log(emails);
  // 출력: ['john@example.com', 'jane@example.com', 'jim@example.com']  
