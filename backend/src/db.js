const mysql = require('mysql2');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'smarthomes',
});

// Connect to MySQL
mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID', mysqlConnection.threadId);
});

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/smarthomes";

const connectMongoDB = async () => {
  
  try {
    const conn = await mongoose.connect(mongoURI); // Use the hardcoded URI here
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Initialize MongoDB Connection
connectMongoDB();

module.exports = {
  mysqlConnection,
};
