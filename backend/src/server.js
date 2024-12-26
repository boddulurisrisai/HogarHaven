require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { mysqlConnection } = require('./db');
const app = express();
const port = 3031;
const saltRounds = 10; // Number of salt rounds for bcrypt
const mongoose = require('mongoose');
const Review = require('./models/Review'); // Adjust the path as needed
const trendingRoutes = require('./routes/trendingRoutes'); // Import the trending routes
const ordersRoute = require('./routes/orders');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
//const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');
const {OpenAI} = require('openai');
const axios = require('axios');
require('dotenv').config();
const sharp = require('sharp');
const { Client } = require('@elastic/elasticsearch');

const { v4: uuidv4 } = require('uuid');


// MySQL connection configuration
const dbOptions = {
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'smarthomes',
};

// Create MySQL connection
const connection = mysql.createConnection(dbOptions);
const sessionStore = new MySQLStore(dbOptions, connection);

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://localhost:27017/smarthomes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('MongoDB connected to localhost:27017'))
    .catch(err => console.error('MongoDB connection error:', err));
}

const reviewSchema = new mongoose.Schema({
  ProductCategory: String,
  ProductModelName: String,
  ProductPrice: Number,
  StoreID: String,
  StoreZip: String,
  StoreCity: String,
  StoreState: String,
  ProductOnSale: Boolean,
  ManufacturerName: String,
  ManufacturerRebate: Boolean,
  UserID: String,
  UserAge: Number,
  UserGender: String,
  UserOccupation: String,
  ReviewRating: Number,
  ReviewDate: Date,
  ReviewText: String,
});


const uri = 'mongodb://localhost:27017'; // Use your MongoDB URI
const mdbName = 'smarthomes'; // Your database name

let mdb;

const connectDB = async () => {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        mdb = client.db(mdbName);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};
const getmDB = () => {
  if (!mdb) {
      throw new Error('Database not initialized. Call connectDB() first.');
  }
  return mdb;
};



connectDB(); 

const ticketSchema = new mongoose.Schema({
  orderId: String,
  description: String,
  image: String,
  ticketNumber: String,
  orderStatus: { type: String, default: 'Pending' },
  decision: String,
  createdAt: { type: Date, default: Date.now },
});



// Create a Mongoose model for the ticket
const Ticket = mongoose.model('Ticket', ticketSchema);

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created:', uploadDir);

}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure 'uploads' directory exists inside 'src'
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const upload = multer({ storage: storage });
// Middleware
// Increase the limit to 1MB (1 * 1024 * 1024 bytes)
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(cors());
app.use(session({
  key: 'session_cookie_name',
  secret: 'SriSai*1999',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use('/api', ordersRoute);
app.use('/api', trendingRoutes); // This can be adjusted as needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper function to log login attempts
function logLoginAttempt(email, accountType, success, userId = null) {
  const insertLogQuery = 'INSERT INTO login_logs (email, account_type, success, user_id) VALUES (?, ?, ?, ?)';
  connection.query(insertLogQuery, [email, accountType, success, userId], (err) => {
    if (err) {
      console.log('Failed to log login attempt:', err);
    }
  });
}

// Helper function to hash passwords
const hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    throw new Error('Hashing failed');
  }
};

// Helper function to insert customer details
const insertCustomer = (customerDetails) => {
  return new Promise((resolve, reject) => {
    const customerQuery = `INSERT INTO customers (name, address, city, state, zip_code, phone_number, creditCard)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(customerQuery, [
      customerDetails.name,
      customerDetails.address,
      customerDetails.city,
      customerDetails.state,
      customerDetails.zip_code,
      customerDetails.phone_number,
      customerDetails.creditCard
    ], (err, customerResult) => {
      if (err) {
        reject('Failed to insert customer data');
      } else {
        resolve(customerResult.insertId);
      }
    });
  });
};

// Helper function to insert orders
const insertOrder = (orderDetails, customerId) => {
  return new Promise((resolve, reject) => {
    const orderQuery = `INSERT INTO orders (customer_id, total_amount, confirmation_number, order_date, delivery_date, delivery_type, store_location)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(orderQuery, [
      customerId,
      orderDetails.total_amount,
      orderDetails.confirmation_number,
      orderDetails.order_date,
      orderDetails.delivery_date,
      orderDetails.delivery_type,
      orderDetails.store_location
    ], (err, orderResult) => {
      if (err) {
        reject('Failed to insert order data');
      } else {
        resolve(orderResult.insertId);
      }
    });
  });
};

// Helper function to insert order items
const insertOrderItems = (orderId, orderItems) => {
  return new Promise((resolve, reject) => {
    const orderItemsArray = orderItems.map(item => [
      orderId,
      item.name,
      item.imageUrl,
      item.price,
      item.quantity,
      item.warranty,
      item.retailerDiscount,
      item.rebate
    ]);
    const orderItemsQuery = `INSERT INTO order_items (order_id, name, imageUrl, product_price, quantity, warranty, retailer_discount, rebate) VALUES ?`;

    connection.query(orderItemsQuery, [orderItemsArray], (err) => {
      if (err) {
        reject('Failed to insert order items');
      } else {
        resolve();
      }
    });
  });
};

// Signup route with hashed passwords
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const [existingUser] = await connection.promise().query(checkQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password and insert new user
    const hashedPassword = await hashPassword(password);
    const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
    await connection.promise().query(insertQuery, [email, hashedPassword]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// User login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      // Compare the entered password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          req.session.userId = user.id;
          logLoginAttempt(email, 'user', true, user.id);
          res.status(200).json({ message: 'Login successful', user });
        } else {
          logLoginAttempt(email, 'user', false);
          res.status(400).json({ error: 'Incorrect password' });
        }
      });
    } else {
      logLoginAttempt(email, 'user', false);
      res.status(400).json({ error: 'Email not found' });
    }
  });
});

app.post('/salesman/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM salesman WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      // Compare the entered password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          req.session.userId = user.id; // Store the user ID in session
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
});


// Salesman and Store Manager login routes follow a similar structure to User login

// Store Manager login with hashed password verification
/*app.post('/store-manager/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM storemanager WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          logLoginAttempt(email, 'storemanager', true, user.id);
          res.status(200).json({ message: 'Login successful', user });
        } else {
          logLoginAttempt(email, 'storemanager', false);
          res.status(400).json({ error: 'Incorrect password' });
        }
      });
    } else {
      logLoginAttempt(email, 'storemanager', false);
      res.status(400).json({ error: 'Email not found' });
    }
  });
});*/
app.post('/store-manager/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM storemanager WHERE email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'An error occurred while checking the password' });

        if (isMatch) {
          logLoginAttempt(email, 'storemanager', true, user.id);
          res.status(200).json({ message: 'Login successful', user });
        } else {
          logLoginAttempt(email, 'storemanager', false);
          res.status(400).json({ error: 'Incorrect password' });
        }
      });
    } else {
      logLoginAttempt(email, 'storemanager', false);
      res.status(400).json({ error: 'Email not found' });
    }
  });
});

// Store data retrieval route
app.get('/api/stores', (req, res) => {
  const sql = 'SELECT * FROM store';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve store data' });
    res.json(results);
  });
});

/*Cart Page
app.post('/api/cart', async (req, res) => {
  const { totalAmount, deliveryOption, items } = req.body;

  if (totalAmount === undefined || deliveryOption === undefined || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Total amount, delivery option, and items are required.' });
  }

  const cartQuery = 'INSERT INTO cart (totalAmount, deliveryOption) VALUES (?, ?)';
  
  try {
    // Insert into the cart
    const [cartResults] = await connection.promise().query(cartQuery, [totalAmount, deliveryOption]);
    const cartId = cartResults.insertId;

    // Prepare items for insertion into cart_items
    const cartItemsQuery = 'INSERT INTO cart_items (orderId, productId, name, image, price, quantity) VALUES ?';
    const cartItemsArray = items.map(item => {
      const maxImageLength = 255; // Set your maximum length for image URL
      const imageValue = item.image && item.image.length > maxImageLength ? null : item.image;

      return [
        cartId,
        item.productId,
        item.name,
        imageValue,  // Use the validated image value
        item.price,
        item.quantity
      ];
    });

    // Insert cart items
    await connection.promise().query(cartItemsQuery, [cartItemsArray]);

    res.status(201).json({ id: cartId, totalAmount, deliveryOption, items });
  } catch (err) {
    console.error('Error inserting into cart or cart_items:', err);
    res.status(500).json({ error: 'Failed to add to cart.' });
  }
});

// API to fetch cart details by cart ID (or user ID if applicable)

app.get('/api/cart/:cartId', (req, res) => {
  const cartId = req.params.cartId;

  // Fetch cart information
  const cartQuery = 'SELECT * FROM cart WHERE id = ?';
  db.query(cartQuery, [cartId], (cartErr, cartResult) => {
    if (cartErr) return res.status(500).json({ error: 'Error fetching cart' });

    if (cartResult.length === 0) return res.status(404).json({ error: 'Cart not found' });

    const cart = cartResult[0];

    // Fetch cart items associated with the cart
    const cartItemsQuery = 'SELECT * FROM cart_items WHERE orderId = ?';
    db.query(cartItemsQuery, [cartId], (itemsErr, itemsResult) => {
      if (itemsErr) return res.status(500).json({ error: 'Error fetching cart items' });

      const cartDetails = {
        cartId: cart.id,
        totalAmount: cart.totalAmount,
        deliveryOption: cart.deliveryOption,
        createdAt: cart.createdAt,
        items: itemsResult,
      };

      res.json(cartDetails);
    });
  });
});
*/

// Fetch customer by email
// Route to check if customer exists



// Route to create a new customer
app.post('/api/customers', (req, res) => {
  const { customer_id, name, email, address, city, state, zipCode, phoneNumber, creditCard } = req.body;

  const query = `INSERT INTO customers (customer_id, name, email, address, city, state, zip_code, phone_number, creditCard)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [customer_id, name, email, address, city, state, zipCode, phoneNumber, creditCard], (err, result) => {
    if (err) {
      console.error('Error inserting customer:', err);
      res.status(500).json({ error: 'Failed to insert customer' });
    } else {
      res.status(201).json({ message: 'Customer created successfully', customer_id });
    }
  });
});

app.get('/api/orders', (req, res) => {
  const query = `
    SELECT o.*, oi.item_id, oi.name, oi.product_price, oi.quantity, oi.imageUrl 
    FROM orders o 
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    ORDER BY o.order_date ASC;
    `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Organize results by order_id
    const orders = {};
    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          confirmation_number: row.confirmation_number,
          customer_id: row.customer_id,
          total_amount: row.total_amount,
          order_status: row.order_status,
          order_date: row.order_date,
          delivery_date: row.delivery_date,
          items: []
        };
      }
      // Add item details to the corresponding order
      if (row.item_id) {
        orders[row.order_id].items.push({
          item_id: row.item_id,
          name: row.name,
          product_price: row.product_price,
          quantity: row.quantity,
          imageUrl: row.imageUrl
        });
      }
    });

    // Send the organized orders array as the response
    res.json(Object.values(orders));
  });
});

// Create a new order
/*app.post('/api/orders', (req, res) => {
  const { confirmation_snumber, customer_id, total_amount, discounts_applied, shipping_cost, tax, delivery_type, delivery_address, store_location, order_status, order_date, delivery_date, warranty_cost, credit_card } = req.body;

  const query = `INSERT INTO orders (confirmation_number, customer_id, total_amount, discounts_applied, shipping_cost, tax, delivery_type, delivery_address, store_location, order_status, order_date, delivery_date, warranty_cost, credit_card)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [confirmation_number, customer_id, total_amount, discounts_applied, shipping_cost, tax, delivery_type, delivery_address, store_location, order_status, order_date, delivery_date, warranty_cost, credit_card], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      res.status(500).json({ error: 'Failed to insert order' });
    } else {
      res.status(201).json({ message: 'Order created successfully', order_id: result.insertId });
    }
  });
});
*/
function formatDateForMySQL(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Helper function to generate a confirmation number (you can use a random string generator or hash)
function generateConfirmationNumber() {
  return Math.random().toString(36).substr(2, 9).toUpperCase(); // Example: ABC123XYZ
}

app.post('/api/orders', async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    creditCard,
    deliveryType,
    deliveryAddress,
    storeLocation,
    cartItems,
    discountsApplied,
    shippingCost,
    tax,
    totalWithShippingAndTax,
    warrantyCost
  } = req.body;

  try {
    // Insert customer details
    const insertCustomerQuery = `
        INSERT INTO customers (name, email, phone_number, address, city, state, zip_code, creditCard)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
    const [customerResult] = await connection.promise().query(insertCustomerQuery, [
      name,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      creditCard
    ]);

    const customerId = customerResult.insertId;

    // Generate confirmation number (assuming you have a function)
    const confirmationNumber = generateConfirmationNumber();

    // Order and delivery dates
    const orderDate = new Date();
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 12);

    // Insert order details
    const insertOrderQuery = `
        INSERT INTO orders (
          confirmation_number, customer_id, total_amount, discounts_applied, 
          shipping_cost, tax, delivery_type, delivery_address, store_location, 
          order_status, order_date, delivery_date, warranty_cost, credit_card
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
    const [orderResult] = await connection.promise().query(insertOrderQuery, [
      confirmationNumber,
      customerId,
      totalWithShippingAndTax,
      discountsApplied,
      shippingCost,
      tax,
      deliveryType,
      deliveryType === 'home' ? deliveryAddress : null,
      deliveryType === 'store' ? storeLocation : null,
      'pending',
      orderDate,
      deliveryDate,
      warrantyCost,
      creditCard
    ]);

    const orderId = orderResult.insertId;

    // Prepare order items data
    const orderItemsData = cartItems.map(item => [
      orderId,
      item.price,
      item.quantity,
      item.warrantySelected ? 1 : 0,
      item.retailer_discount || 0,
      item.rebate || 0,
      item.name,
      item.imageUrl || null
    ]);

    // Insert order items
    const insertOrderItemsQuery = `
        INSERT INTO order_items (
          order_id, product_price, quantity, warranty, retailer_discount, rebate, name, imageUrl
        )
        VALUES ?
      `;
    await connection.promise().query(insertOrderItemsQuery, [orderItemsData]);

    // Respond to the client
    res.status(201).json({
      message: 'Order placed successfully',
      order_id: orderId,
      confirmation_number: confirmationNumber
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});


app.get('/api/reviews/:doorbellId', async (req, res) => {
  try {
    const reviews = await Review.find({ doorbellId: req.params.doorbellId });
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

/*
app.delete('/api/orders/:confirmationNumber', async (req, res) => {
  try {
    const result = await Order.findOneAndDelete({ confirmation_number: req.params.confirmationNumber });
    if (!result) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ message: 'Order canceled successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});
*/
//Delete from db
app.delete('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;

  // Start a transaction
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to start transaction.' });
    }

    const deleteOrderItemsQuery = `
        DELETE FROM order_items
        WHERE order_id = ?;
      `;

    // First, delete from order_items
    connection.query(deleteOrderItemsQuery, [orderId], (error) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Error deleting order items:', error);
          return res.status(500).json({ message: 'Failed to delete order items.' });
        });
      }

      const deleteOrderQuery = `
          DELETE FROM orders
          WHERE order_id = ?;
        `;

      // Then, delete from orders
      connection.query(deleteOrderQuery, [orderId], (error, results) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error deleting order:', error);
            return res.status(500).json({ message: 'Failed to delete the order.' });
          });
        }

        // Check if any rows were affected (order found)
        if (results.affectedRows === 0) {
          return connection.rollback(() => {
            return res.status(404).json({ message: 'Order not found.' });
          });
        }

        // Commit the transaction if everything went well
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ message: 'Failed to commit transaction.' });
            });
          }

          res.status(200).json({ message: 'Order and order items canceled successfully.' });
        });
      });
    });
  });
});


// server.js

app.get('/api/reviews/:ProductModelName', async (req, res) => {
  const { ProductModelName } = req.params.ProductModelName; // Extract ProductModelName from request parameters

  try {
    // Fetch reviews from the database based on ProductModelName
    const reviews = await Review.find({ ProductModelName });

    // Check if any reviews were found
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this product model' });
    }

    // Return the found reviews
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
app.get('/api/reviews', async (req, res) => {
  const productModelName = req.query.ProductModelName;
  try {
    const reviews = await Review.find({ ProductModelName: productModelName });
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send('Server error');
  }
});

/* trending page */

app.get('/api/trending', async (req, res) => {
  try {
    // Top five most liked products (highest average review rating)
    const mostLikedProducts = await Review.aggregate([
      {
        $group: {
          _id: "$ProductModelName",
          averageRating: { $avg: "$ReviewRating" },
          totalLikes: {
            $sum: { $cond: [{ $gte: ["$ReviewRating", 4] }, 1, 0] } // Count as a like if rating is 4 or higher
          },
        }
      },
      { $sort: { averageRating: -1, totalLikes: -1 } }, // Sort by average rating and total likes
      { $limit: 5 }
    ]);

    //console.log('Most Liked Products:', mostLikedProducts);

    // Top five zip-codes where maximum number of products sold
    const zipCodeStats = await Review.aggregate([
      {
        $group: {
          _id: "$StoreZip",
          totalSold: { $sum: 1 } // Assuming each review corresponds to a sold product
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    //console.log('Top Zip Codes:', zipCodeStats);

    // Top five most sold products regardless of the rating
    const mostSoldProducts = await Review.aggregate([ // Changed from reviews to Review
      {
        $group: {
          _id: "$ProductModelName",
          totalSold: { $sum: 1 } // Assuming each review corresponds to a sold product
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // console.log('Most Sold Products:', mostSoldProducts);

    // Send the collected data as JSON
    res.json({
      mostLikedProducts,
      topZipCodes: zipCodeStats,
      mostSoldProducts
    });
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/products', (req, res) => {
  connection.query('SELECT * FROM products', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { product_name, product_category, product_price, product_image } = req.body;

  // Set a default image URL if product_image is not provided
  const defaultImageUrl = '/images/doorbell/smart-doorbell.jpg'; // Replace with your default image URL
  const imageUrl = defaultImageUrl;

  const sql = 'INSERT INTO products (product_name, product_category, product_price, product_image) VALUES (?, ?, ?, ?)';

  connection.query(sql, [product_name, product_category, product_price, imageUrl], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ insertId: results.insertId });
  });
});


// Update a product
app.put('/api/products/:product_name', (req, res) => {
  const { product_name, product_category, product_price, product_image } = req.body;
  const productName = req.params.product_name;
  const sql = 'UPDATE products SET product_name = ?, product_category = ?, product_price = ? WHERE product_name = ?';

  connection.query(sql, [product_name, product_category, product_price, productName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ affectedRows: results.affectedRows });
  });
});

// Update product status to unavailable
app.put('/api/products/delete/:product_id', (req, res) => {
  const productId = req.params.product_id;

  // Update the product's status to 'unavailable'
  const updateStatusSql = 'UPDATE products SET status = ? WHERE product_id = ?';
  connection.query(updateStatusSql, ['unavailable', productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if the update was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'Product status updated to unavailable' });
  });
});

// Function to delete the product




//Inventory

app.get('/api/products/inventory', (req, res) => {
  connection.query(
    'SELECT product_name, product_price, available_quantity FROM products',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

app.get('/api/products/sale', (req, res) => {
  connection.query(
    `
        SELECT product_name, product_price, available_quantity
        FROM products
        WHERE on_sale = TRUE
        `,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching products on sale' });
      }
      res.status(200).json(results);
    }
  );
});

// Endpoint to get products with rebates
app.get('/api/products/rebates', (req, res) => {
  connection.query(
    `
        SELECT product_name, product_price, available_quantity
        FROM products
        WHERE rebate = TRUE
        `,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching products with rebates' });
      }
      res.status(200).json(results);
    }
  );
});

//Sales Report

// 1. Get all products sold
app.get('/api/sales/products', (req, res) => {
  const query = `
      SELECT 
          p.product_name,
          p.product_price,
          SUM(s.quantity_sold) AS totalSold,
          SUM(s.quantity_sold * p.product_price) AS totalSales
      FROM 
          sales s
      JOIN 
          products p ON s.product_id = p.product_id
      GROUP BY 
          p.product_id;
  `;
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.json(results);
  });
});

// 2. Get total daily sales
app.get('/api/sales/daily', (req, res) => {
  const query = `
      SELECT 
          DATE(sale_date) AS sale_date,
          SUM(quantity_sold * product_price) AS totalSales
      FROM 
          sales s
      JOIN 
          products p ON s.product_id = p.product_id
      GROUP BY 
          DATE(sale_date)
      ORDER BY 
          sale_date;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.json(results);
  });
});

//Get Orders for Open Ticket Page

app.get('/api/orderid', (req, res) => {
  const query = 'SELECT order_id FROM orders';

  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching orders' });
    } else {
      const orderIds = results.map((row) => row.order_id);
      res.json({ orders: orderIds });
    }
  });
});

async function resizeAndEncodeImage(imagePath) {
  try {
    // Resize the image to a smaller width (e.g., 256px) and convert to buffer
    const resizedImageBuffer = await sharp(imagePath)
      .resize(256) // Set the width to 256 pixels; adjust as needed
      .toBuffer();

    // Convert the resized buffer to base64 string
    return resizedImageBuffer.toString('base64');
  } catch (error) {
    console.error('Error resizing and encoding image:', error);
    throw new Error('Failed to resize and encode image');
  }
}

function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}
// Endpoint to create a ticket
// Helper function for OpenAI API call with retry logic
async function createCompletionWithBackoff(payload, maxRetries = 3) {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      const response = await openai.chat.completions.create(payload);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.log("Rate limit hit, retrying after delay...");
        await new Promise((res) => setTimeout(res, 1000)); // Wait for 1 second
        retries--;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Route to handle ticket creation
app.post('/api/tickets', upload.single('image'), async (req, res) => {
  try {
    const ticketNumber = uuidv4();
    const { orderId, description } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Ensure image is provided
    if (!imagePath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Resize and encode the image in base64
    const base64Image = await resizeAndEncodeImage(imagePath);

    // Prepare payload for OpenAI API
    const payload = {
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Analyze the image and description to determine if it is a Refund, Replace, or Escalate issue. Description: "${description}"`,
        },
        {
          role: "user",
          content: `data:image/jpeg;base64,${base64Image}`,
        },
      ],
      max_tokens: 50,
    };

    // Call OpenAI API with retry mechanism
    const response = await createCompletionWithBackoff(payload);

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Unexpected response format from OpenAI API");
    }

    const decision = response.choices[0].message.content.trim();

    // Prepare the ticket object with decision
    const newTicket = new Ticket({
      orderId: orderId, // Include the orderId here

      ticketNumber: ticketNumber,
      description: description,
      image: imagePath,
      decision: decision,
    });

    // Save the ticket to MongoDB
    await newTicket.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketNumber: ticketNumber,
      decision: decision
    });
  } catch (error) {
    console.error('Error creating ticket:', error.message);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// TicketStatusPage

app.get('/api/tickets/status/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    // Find the ticket using the Mongoose model
    const ticket = await Ticket.findOne({ ticketNumber });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Ensure orderId exists in the ticket
    if (!ticket.orderId) {
      return res.status(404).json({ message: 'Order ID not found in ticket' });
    }

    // Determine the new order status based on the ticket decision
    let newOrderStatus = null;
    switch (ticket.decision) {
      case 'Refund':
        newOrderStatus = 'Refund Order';
        break;
      case 'Replace':
        newOrderStatus = 'Replace Order';
        break;
      case 'Escalate':
        newOrderStatus = 'Escalate to Human Agent';
        break;
      default:
        return res.status(400).json({ message: 'Invalid ticket decision' });
    }

    // Update the order status in MySQL
    try {
      const [updateResult] = await connection.promise().execute(
        `UPDATE orders SET order_status = ? WHERE order_id = ?`,
        [newOrderStatus, ticket.orderId]
      );

      // Ensure that the update was successful
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Failed to update order status' });
      }
    } catch (updateError) {
      console.error('MySQL Update Error:', updateError);
      return res.status(500).json({ error: 'Failed to update order status' });
    }

    // Fetch updated order details from MySQL
    try {
      const [orderRows] = await connection.promise().execute(
        `SELECT o.order_id, o.order_status, oi.name, oi.imageUrl
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         WHERE o.order_id = ?`,
        [ticket.orderId]
      );

      // Ensure orderRows is not empty
      if (!orderRows || orderRows.length === 0) {
        return res.status(404).json({ message: 'No order details found' });
      }

      // Construct the image URL for serving to the front-end
      const imageUrl = ticket.image ? `http://localhost:3030/uploads/${path.basename(ticket.image)}` : null;

      // Send back ticket details with updated order details
      res.status(200).json({
        ticketNumber: ticket.ticketNumber,
        description: ticket.description,
        decision: ticket.decision,
        createdAt: ticket.createdAt,
        image: imageUrl,
        orderDetails: orderRows
      });
    } catch (queryError) {
      console.error('MySQL Query Error:', queryError);
      return res.status(500).json({ error: 'Failed to fetch order details' });
    }
  } catch (error) {
    console.error('Error fetching ticket status:', error);
    res.status(500).json({ error: 'Failed to fetch ticket status' });
  }
});
/*
app.get('/api/tickets/status/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    // Find the ticket using the Mongoose model
    const ticket = await Ticket.findOne({ ticketNumber });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Ensure orderId exists
    if (!ticket.orderId) {
      return res.status(404).json({ message: 'Order ID not found in ticket' });
    }
    
    console.log('Ticket Order ID:', ticket.orderId);
    
    // Use the existing MySQL connection
    try {
      const [orderRows] = await connection.promise().execute(
        `SELECT o.order_id, o.order_status, oi.name, oi.imageUrl
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_id = ?`, 
        [ticket.orderId]
      );
      
      // Ensure orderRows is not empty
      if (!orderRows || orderRows.length === 0) {
        return res.status(404).json({ message: 'No order details found' });
      }
      
      // Construct the image URL for serving to the front-end
      const imageUrl = ticket.image ? `http://localhost:3030/uploads/${path.basename(ticket.image)}` : null;
      
      // Send back ticket details with order details
      res.status(200).json({
        ticketNumber: ticket.ticketNumber,
        description: ticket.description,
        decision: ticket.decision,
        createdAt: ticket.createdAt,
        image: imageUrl,
        orderDetails: orderRows
      });
    } catch (queryError) {
      console.error('MySQL Query Error:', queryError);
      return res.status(500).json({ error: 'Failed to fetch order details' });
    }
  } catch (error) {
    console.error('Error fetching ticket status:', error);
    res.status(500).json({ error: 'Failed to fetch ticket status' });
  }
});
*/

// Smart Doorbell

app.get('/api/products/productlist', (req, res) => {
  const category = req.query.product_category;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const query = 'SELECT * FROM products WHERE product_category = ? AND status = "available"';

  connection.query(query, [category], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found for this category' });
    }
    res.json(results);
  });
});







//const { indexReviewsInElasticSearch, getEmbedding, indexProductsInElasticSearch } = require('./elasticsearchService');

app.use(express.json());

// ElasticSearch client initialization
const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200' });

// Endpoint to index all reviews from MongoDB into ElasticSearch
// app.get('/api/index-reviews', async (req, res) => {
//     try {
//         await indexReviewsInElasticSearch(mongoose); // Use existing MongoDB connection
//         res.json({ message: 'All reviews have been indexed in ElasticSearch' });
//     } catch (error) {
//         console.error('Error indexing reviews:', error);
//         res.status(500).json({ error: 'Error indexing reviews' });
//     }
// });

// // Endpoint to search for reviews by semantic similarity
// app.post('/api/search-reviews', async (req, res) => {
//     const { query } = req.body;
//     try {
//         const embedding = await getEmbedding(query);
//         const results = await esClient.search({
//             index: 'product_reviews',
//             size: 3,
//             body: {
//                 query: {
//                     script_score: {
//                         query: { match_all: {} },
//                         script: {
//                             source: "cosineSimilarity(params.query_vector, 'ReviewEmbedding') + 1.0",
//                             params: { query_vector: embedding },
//                         },
//                     },
//                 },
//             },
//         });

//         res.json({
//             results: results.hits.hits.map(hit => ({
//                 ...hit._source,
//                 _score: hit._score,
//             })),
//         });
//     } catch (error) {
//         console.error('Error searching reviews:', error);
//         res.status(500).json({ error: 'Error searching reviews' });
//     }
// });
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute window
//   max: 2, // Limit each IP to 2 requests per windowMs
//   message: {
//     error: "Too many requests. Please try again later."
//   }
// });

// Apply the rate limit to the specific routes
//app.use('/search-reviews', limiter);
// const { generateReviews, storeReviewsInElasticsearch, searchReviews } = require('./elasticsearchService'); // Import functions

// const products = []; // Initialize an empty array to store products

// // SQL query to fetch product data
// const query = 'SELECT product_id, product_name, product_category FROM products';

// // Execute the query
// connection.query(query, (error, results) => {
//   if (error) {
//     console.error('Error fetching products:', error);
//     return;
//   }

//   // Store the results in the `products` array in the desired format
//   results.forEach(product => {
//     products.push({
//       id: product.product_id.toString(),
//       name: product.product_name,
//       category: product.product_category,
//     });
//   });

  
// });

// const getRandomProducts = () => {
//   return new Promise((resolve, reject) => {
//     const query = 'SELECT product_id, product_name, product_category FROM products ORDER BY RAND() LIMIT 10';
//     connection.query(query, (error, results) => {
//       if (error) {
//         return reject(error);
//       }
//       const products = results.map(product => ({
//         id: product.product_id.toString(),
//         name: product.product_name,
//         category: product.product_category,
//       }));
//       resolve(products);
//     });
//   });
// };

// // Endpoint to search reviews and generate reviews for products
// app.get('/search-reviews', async (req, res) => {
//   const { query } = req.query;

//   if (!query) {
//     return res.status(400).json({ error: 'Query parameter is required.' });
//   }

//   try {
//     // Step 1: Generate reviews for all products
//     //await generateReviewsForProducts();

//     // Step 2: Search for reviews based on the input query using semantic similarity
//     const result = await searchReviews(query);

//     return res.status(200).json({ reviews: result });
//   } catch (error) {
//     console.error('Error in /search-reviews:', error);
//     return res.status(500).json({ error: 'Server error while searching reviews' });
//   }
// });




// Function to generate reviews for all products
// const generateReviewsForAllProducts = async () => {
//   // Step 1: For each product, generate reviews based on category and keywords
//   for (const product of products) {
//     // Generate reviews using the product data and keywords
//     const reviews = await generateReviews(product);

//     // Step 2: Store the generated reviews in Elasticsearch
//     await storeReviewsInElasticsearch(product, reviews);
//   }
// };

// const generateReviewsForProducts = async () => {
//   try {
//     // Fetch 10 random products
//     const products = await getRandomProducts();

//     // Process each product
//     for (const product of products) {
//       // Step 1: Generate 5 reviews for the product
//       const reviews = await generateReviews(product);

//       // Step 2: Generate embeddings for each review
//       const reviewsWithEmbeddings = await Promise.all(
//         reviews.map(async review => {
//           // Generate embedding using OpenAI embeddings API
//           const embeddingResponse = await openai.embeddings.create({
//             model: 'text-embedding-ada-002',
//             input: review.review,
//           });
//           const embedding = embeddingResponse.data[0].embedding;

//           // Add embedding to the review object
//           return {
//             ...review,
//             embedding,
//           };
//         })
//       );

//       // Step 3: Store the reviews with embeddings in Elasticsearch
//       await storeReviewsInElasticsearch(product, reviewsWithEmbeddings);
//     }
//   } catch (error) {
//     console.error('Error generating reviews for products:', error);
//   }
// };

// // Endpoint to index all products from MySQL into ElasticSearch
// app.get('/api/index-products', async (req, res) => {
//     try {
//         await indexProductsInElasticSearch(connection); // Use existing MySQL connection
//         res.json({ message: 'All products have been indexed in ElasticSearch.' });
//     } catch (error) {
//         console.error('Error indexing products:', error);
//         res.status(500).json({ error: 'Error indexing products.' });
//     }
// });

// // Endpoint to search for products by semantic similarity
// app.post('/api/search-products', async (req, res) => {
//     const { query } = req.body;

//     try {
//         const embedding = await getEmbedding(query);
//         const results = await esClient.search({
//             index: 'products',
//             size: 8,
//             body: {
//                 query: {
//                     script_score: {
//                         query: { match_all: {} },
//                         script: {
//                             source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
//                             params: { query_vector: embedding },
//                         },
//                     },
//                 },
//             },
//         });

//         res.json({
//             results: results.hits.hits.map(hit => ({
//                 ...hit._source,
//                 _score: hit._score,
//             })),
//         });
//     } catch (error) {
//         console.error('Error searching products:', error);
//         res.status(500).json({ error: 'Error searching products' });
//     }
// });









// //Search Reviews
// /*

// */
//   const { indexReviewsInElasticSearch, getEmbedding, indexProductsInElasticSearch} = require('./elasticsearchService');
//   app.use(express.json());

//   // Initialize ElasticSearch client
//   const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

//   // Endpoint to index all reviews from MongoDB to ElasticSearch
//   app.get('/api/index-reviews', async (req, res) => {
//       try {
//           await indexReviewsInElasticSearch(mongoose); // Pass the MongoDB instance
//           res.json({ message: 'All reviews have been indexed in ElasticSearch' });
//       } catch (error) {
//           console.error('Error indexing reviews:', error);
//           res.status(500).json({ error: 'Error indexing reviews' });
//       }
//   });

//   app.use(express.json());

//   // Endpoint to search for reviews by semantic similarity
//   app.post('/api/search-reviews', async (req, res) => {
//       const { query } = req.body;
//       try {
//           const embedding = await getEmbedding(query);
//           const results = await esClient.search({
//               index: 'product_reviews',
//               size: 3, // Limit results to top 3
//               body: {
//                   query: {
//                       script_score: {
//                           query: { match_all: {} },
//                           script: {
//                               source: "cosineSimilarity(params.query_vector, 'ReviewEmbedding') + 1.0",
//                               params: { query_vector: embedding },
//                           },
//                       },
//                   },
//               },
//           });

//           res.json({
//               results: results.hits.hits.map(hit => ({
//                   ...hit._source,
//                   _score: hit._score
//               })),
//           });
//       } catch (error) {
//           console.error('Error searching reviews:', error);
//           res.status(500).json({ error: 'Error searching reviews' });
//       }
//   });


//   require('dotenv').config();




// // Endpoint to index all products from MySQL into Elasticsearch
// app.get('/api/index-products', async (req, res) => {
//     try {
//         await indexProductsInElasticSearch(connection);
//         res.json({ message: 'All products have been indexed in Elasticsearch.' });
//     } catch (error) {
//         console.error('Error indexing products:', error);
//         res.status(500).json({ error: 'Error indexing products.' });
//     }
// });



// // Endpoint to search for products by semantic similarity
// app.post('/api/search-products', async (req, res) => {
//     const { query } = req.body;

//     try {
//         // Generate embedding for the query
//         const embedding = await getEmbedding(query);

//         // Perform the search in the "products" index
//         const results = await esClient.search({
//             index: 'products',
//             size: 8, // Limit results to top 8
//             body: {
//                 query: {
//                     script_score: {
//                         query: { match_all: {} },
//                         script: {
//                             source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
//                             params: { query_vector: embedding },
//                         },
//                     },
//                 },
//             },
//         });

//         // Return the search results
//         res.json({
//             results: results.hits.hits.map(hit => ({
//                 ...hit._source,
//                 _score: hit._score
//             })),
//         });
//     } catch (error) {
//         console.error('Error searching products:', error);
//         res.status(500).json({ error: 'Error searching products' });
//     }
// });


const {
  generateProductRecords,
  storeProductsInMySQL,
  createIndexIfNotExists,
  indexProductsInElasticSearch,
  getEmbedding,
  productsMappings,
  generateProductReviews,
  storeReviewsInMongoDb,
  indexReviewsInElasticSearch,
  reviewsMappings,
} = require('./elasticsearchService');


app.use(express.json());

// SmartHome Categories
const categories = ['Doorbell', 'Doorlock', 'Lighting', 'Speaker', 'Thermostat'];

// Combined API to generate products, store in MySQL, and index in Elasticsearch
app.get('/api/generate-and-index-products', async (req, res) => {
  try {
      console.log('Step 1: Generating product records...');
      const products = await generateProductRecords(categories);

      console.log('Step 2: Storing product records in MySQL...');
      await storeProductsInMySQL(products, connection);

      console.log('Step 3: Ensuring Elasticsearch index exists...');
      await createIndexIfNotExists('products', productsMappings);

      console.log('Step 4: Fetching product records from MySQL and indexing to Elastic search...');
      await indexProductsInElasticSearch(connection);

      console.log('All steps completed successfully, You are ready to perform elastic search.');
      res.json({ message: 'Products generated, stored, and indexed successfully!' });
  } catch (error) {
      console.error('Error in generating, storing, or indexing products:', error);
      res.status(500).json({ error: 'Error in processing products.' });
  }
});

app.get('/api/generate-and-index-product-reviews', async (req, res) => {
  try {
      console.log('Step 1: Generating Product Reviews with OpenAI...');
      const reviews = await generateProductReviews(categories, 1); // Generate reviews for 10 products

      console.log('Step 2: Storing generated product reviews in MongoDB...');
      await storeReviewsInMongoDb(reviews, mdb);

      console.log('Step 3: Ensuring Elasticsearch index for reviews exists...');
      await createIndexIfNotExists('product_reviews', reviewsMappings);

      console.log('Step 4: Fetching product reviews from MongoDB and indexing to Elasticsearch...');
      await indexReviewsInElasticSearch(mdb);

      console.log('All steps completed successfully, You are ready to perform Elasticsearch on reviews.');
      res.json({ message: 'Product reviews generated, stored, and indexed successfully!' });
  } catch (error) {
      console.error('Error in generating, storing, or indexing product reviews:', error);
      res.status(500).json({ error: 'Error in processing product reviews.' });
  }
});

app.post('/api/search-products', async (req, res) => {
  const { query } = req.body;

  try {
      console.log('Generating embedding for query...');
      const embedding = await getEmbedding(query);

      console.log('Searching products in Elasticsearch...');
      const results = await esClient.search({
          index: 'products',
          size: 5, // Limit results to top 3
          body: {
              query: {
                  script_score: {
                      query: { match_all: {} },
                      script: {
                          source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                          params: { query_vector: embedding },
                      },
                  },
              },
          },
      });

      console.log('Search completed. Returning results...');
      res.json({
          results: results.hits.hits.map((hit) => ({
              name: hit._source.name || "Unnamed Product",
              price: parseFloat(hit._source.price) || 0, // Ensure price is a float
              category: hit._source.category || "Uncategorized",
              description: hit._source.description || "No description available",
          })),
      });

  } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Error searching products' });
  }
});

app.post('/api/search-reviews', async (req, res) => {
  const { query } = req.body;

  try {
      console.log('Generating embedding for review query...');
      const embedding = await getEmbedding(query);

      console.log('Searching reviews in Elasticsearch...');
      const results = await esClient.search({
          index: 'product_reviews',
          size: 5, // Limit results to top 8
          body: {
              query: {
                  script_score: {
                      query: { match_all: {} },
                      script: {
                          source: "cosineSimilarity(params.query_vector, 'ReviewEmbedding') + 1.0",
                          params: { query_vector: embedding },
                      },
                  },
              },
          },
      });

      console.log('Search completed. Returning results...');
      res.json({
          results: results.hits.hits.map((hit) => ({
              ProductModelName: hit._source.productName || "Unnamed Product",
              ReviewText: hit._source.reviewText || "No review text available",
              ReviewRating: hit._source.rating || 0,
              ProductCategory: hit._source.productCategory || "Uncategorized",
              ReviewDate: hit._source.reviewDate || "Unknown Date",
          })),
      });
  } catch (error) {
      console.error('Error searching reviews:', error);
      res.status(500).json({ error: 'Error searching reviews' });
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
