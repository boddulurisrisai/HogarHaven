const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/store-manager/login', authController.storeManagerLogin);
router.post('/salesman/login', authController.salesmanLogin);

module.exports = router;
