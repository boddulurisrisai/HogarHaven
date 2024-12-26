const bcrypt = require('bcrypt');

// Replace with the password you want to hash
const plainTextPassword = 'Salesman@123';

bcrypt.hash(plainTextPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('Hashed Password:', hashedPassword);
});
