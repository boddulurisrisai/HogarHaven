# HogarHaven E-commerce Application

## Project Overview

The HogarHaven E-commerce Application is a web-based enterprise solution designed for an online retailer specializing in smart home devices. The application allows customers to browse and purchase products, manage their accounts, and interact with various functionalities, while store managers and sales staff can manage inventory and orders efficiently.

This project implements object-oriented design principles and follows the Model-View-Controller (MVC) architecture to ensure flexibility, reusability, and extensibility.

---

## Features

### **Customer Functionalities**

- **Account Management**: Create accounts, log in, and manage personal information.
- **Product Browsing**: View product categories and details, including associated accessories.
- **Shopping Cart**: Add or remove items from the cart and view the current selection.
- **Order Placement**: Place orders for home delivery or in-store pickup with real-time data storage in MySQL.
- **Order Management**: Check order status, cancel orders, and view order history.
- **Payment Integration**: Secure credit card payment processing.
- **Product Reviews**: Submit and view reviews, stored in a MongoDB NoSQL database.
- **Trending Products**: View trends such as top-rated products, most sold items, and best-performing regions.
- **Customer Service**:
  - Open a ticket by submitting text and an image for a received shipment.
  - Check ticket status with decisions like Refund, Replace, or Escalate to Human Agent using OpenAI models.
- **Review Search and Product Recommendations**:
  - Search for semantically similar reviews using OpenAI embeddings and ElasticSearch.
  - Recommend products based on semantic similarity to user input.

### **Store Manager Functionalities**

- **Inventory Management**: Add, update, or delete products.
- **Sales Reporting**: Generate reports for sales and visualize data using Google Charts.
- **Inventory Reporting**: Monitor stock levels and product status (e.g., on sale, with rebates).

### **Advanced Functionalities**

- **Search Auto-Completion**: Real-time search suggestions powered by MySQL and AJAX.
- **Analytics**:
  - Top 5 most liked products.
  - Top 5 ZIP codes with maximum sales.
  - Top 5 most sold products.

---

## Additional Requirements

### **Customer Service Module**

1. Add a **Customer Service** button/link to the menu bar.
2. On click, provide options:
   - **Open a Ticket**: Allows the user to submit a text description and upload an image of a received shipment. Assigns a unique ticket number upon submission.
   - **Status of a Ticket**: Lets the user check the status of a ticket by entering its number, with possible decisions:
     1. Refund Order
     2. Replace Order
     3. Escalate to Human Agent
3. Use OpenAI models to analyze submitted images and determine the ticket decision.
4. Demonstrate the feature with six pre-defined tickets covering all three cases (Refund, Replace, Escalate).

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Databases**:
  - MongoDB for NoSQL data storage (e.g., product reviews).
  - MySQL for relational data (e.g., user accounts and transactions).
- **Search Engine**: ElasticSearch managed using Docker.
- **Architecture**: MVC Pattern
- **AI Models**: OpenAI GPT and Embedding Models
- **Programming Principles**: Object-Oriented Design

---

## Project Structure

- **Frontend**: JavaScript-based components for UI/UX and interaction.
- **Backend**: Node.js + Express.js handles business logic and data communication.
- **Databases**:
  - MySQL for user accounts, transactions, and inventory.
  - MongoDB for customer reviews.
  - ElasticSearch for product and review embeddings, managed using Docker.
- **Utilities**:
  - Backend services for handling CRUD operations and search.
- **Reports**: Dynamic reports for inventory and sales data.

---

## How to Install and Run

1. **Pre-requisites**:

   - MySQL, MongoDB, and ElasticSearch installed and running.
   - Docker installed for managing ElasticSearch.
   - Node.js installed for the backend.

2. **Database Setup**:

   - Import the MySQL schema for products, users, and transactions.
   - Initialize MongoDB collections for product reviews.
   - Use Docker to set up ElasticSearch and store embeddings.

3. **Backend**:

   - Navigate to the backend project directory.
   - Run `npm install` to install dependencies.
   - Start the server using `node server.js`.

4. **Frontend**:

   - Navigate to the frontend project directory.
   - Run `npm install` to install dependencies.
   - Start the frontend development server using `npm start`.

5. **Access**:
   - Open the application in a web browser at the specified localhost URL.

---

## Known Limitations

- The search auto-completion may require further optimization for larger datasets.
- Reports are limited to bar chart visualizations for now.

---

## Future Enhancements

- Integrate payment gateway APIs for enhanced security.
- Expand reporting capabilities to include pie charts and line graphs.
- Introduce a mobile-friendly design.

---
