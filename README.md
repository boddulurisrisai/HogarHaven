# HogarHaven E-commerce Application

## Overview

HogarHaven is a servlet-based web application for an online retailer that allows customers to browse and purchase smart home products. The application supports customer account management, order placement, and product reviews, with additional features like trending products, inventory, and sales reports, as well as AI-driven recommendations and customer service ticketing. The platform uses **React** for the frontend, **Node.js** for the backend, and **MySQL** and **MongoDB** for database management.

## Features

- **Product Categories**:
  - Smart Doorbells
  - Smart Doorlocks
  - Smart Speakers
  - Smart Lightings
  - Smart Thermostats
- **Customer Functionality**:
  - Create and manage accounts
  - Place orders with store pickup or home delivery
  - View order status, cancel orders, and leave product reviews
  - Payment via credit card
  - Search and browse products
  - Submit and view product reviews
  - AI-based product recommendations and semantic search for reviews
- **Store Manager Features**:
  - Add, update, and delete products
  - Generate inventory and sales reports
  - View trending products and customer reviews
  - Manage customer service tickets

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Databases**: MySQL, MongoDB, Elasticsearch
- **APIs**: OpenAI (GPT-4), ElasticSearch
- **Tools**: Docker, GitHub, Jira

## Database Setup

### MySQL

- MySQL is used to store:
  - Product catalog
  - Customer information
  - Orders and transactions
  - Store locations
  - Customer reviews
- Ensure you have a running MySQL instance with the following tables:
  - **Stores**: StoreID, Address, City, State, Zip-code
  - **Products**: ProductID, Name, Price, Description, Category, Accessories
  - **Customers**: UserID, Name, Address, Email, etc.
  - **Transactions**: TransactionID, OrderDetails, PaymentInfo, ShippingCost, TotalSales
  - **ProductReviews**: ReviewID, ProductID, Rating, ReviewText, UserID

### MongoDB

- MongoDB stores product reviews with detailed metadata.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smarthomes.git
   cd smarthomes
   ```

#### Frontend:

```bash
cd client
npm install
```

#### Backend:

```bash
cd server
npm install
```

### Set up the databases:

- **MySQL**: Create the necessary tables using the provided SQL scripts.
- **MongoDB**: Ensure the MongoDB instance is running.
- **Elasticsearch**: Set up for semantic search features.

### Configure `.env` files:

- Update the `.env` files with your database credentials and other necessary configurations for MySQL, MongoDB, and Elasticsearch.

### Run the project:

#### Frontend:

```bash
cd client
npm start
```

#### Backend:

```bash
cd server
npm start
```

## Usage

1. Navigate to the SmartHomes website in your browser.
2. Create an account or log in.
3. Browse and search for products.
4. Add items to your shopping cart and proceed to checkout.
5. Choose store pickup or home delivery.
6. Submit reviews for purchased products.
7. Access customer service for ticket creation and status updates.

## AI Features

- **Trending Products**: View the top 5 most sold products, most liked products, and top zip codes for product sales.
- **Product Recommendations**: Use OpenAI models to generate recommendations based on user search queries.
- **Semantic Search for Reviews**: Search for reviews similar to entered keywords using embeddings in Elasticsearch.

## Customer Service

- **Open a Ticket**: Submit an issue with your received product, including an image, and receive a unique ticket number.
- **Ticket Status**: Check the status of your ticket and receive a decision on refund, replacement, or escalation.

## Reports

- **Inventory Report**: Generate a table and bar chart showing the availability of products.
- **Sales Report**: Generate tables and charts showing product sales and daily sales totals.
