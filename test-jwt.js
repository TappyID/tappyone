const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tappyone_jwt_secret_2024_secure_key_a8f9e2d1c5b7f3e6a4d8c9b2e5f1a7d3';
const userId = 'ce065849-4fa7-4757-a2cb-5581cfec9225'; // Do log que vimos

const token = jwt.sign(
  { 
    userId: userId,
    userID: userId, // Algumas APIs podem usar esta variação
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
  },
  JWT_SECRET
);

console.log('Token JWT gerado:');
console.log(token);

console.log('\nComando curl para testar:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:8081/api/agendamentos`);
