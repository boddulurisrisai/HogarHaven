const db = require('../config/dbConfig');

const User = {
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  },
  create: (userData, callback) => {
    db.query('INSERT INTO users SET ?', userData, callback);
  },
  // Add other methods as needed
};

module.exports = User;
