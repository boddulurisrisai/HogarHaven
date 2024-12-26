const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { username, email, password } = req.body;
  User.findByEmail(email, (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
      User.create({ username, email, password: hashedPassword }, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating user' });
        }
        res.status(201).json({ message: 'User created' });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    });
  });
};

exports.storeManagerLogin = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM storemanager WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          req.session.userId = user.id; // Assuming you're using sessions
          logLoginAttempt(email, 'store-manager', true, user.id);
          res.status(200).json({ message: 'Login successful', user });
        } else {
          logLoginAttempt(email, 'store-manager', false);
          res.status(400).json({ error: 'Incorrect password' });
        }
      });
    } else {
      logLoginAttempt(email, 'store-manager', false);
      res.status(400).json({ error: 'Email not found' });
    }
  });
};

// Salesman login
exports.salesmanLogin = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM salesman WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          req.session.userId = user.id; // Assuming you're using sessions
          logLoginAttempt(email, 'salesman', true, user.id);
          res.status(200).json({ message: 'Login successful', user });
        } else {
          logLoginAttempt(email, 'salesman', false);
          res.status(400).json({ error: 'Incorrect password' });
        }
      });
    } else {
      logLoginAttempt(email, 'salesman', false);
      res.status(400).json({ error: 'Email not found' });
    }
  });
};