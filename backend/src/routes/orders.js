// routes/orders.js (or your routes file)
const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Route to get order details along with order items by order_id
router.get('/:orderId/details', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [result] = await db.execute(
      `SELECT 
        o.order_id, 
        o.confirmation_number, 
        o.customer_id, 
        o.total_amount, 
        o.discounts_applied, 
        o.shipping_cost, 
        o.tax, 
        o.delivery_type, 
        o.delivery_address, 
        o.store_location, 
        o.order_status, 
        o.order_date, 
        o.delivery_date, 
        oi.item_id, 
        oi.product_price, 
        oi.quantity, 
        oi.warranty, 
        oi.retailer_discount, 
        oi.rebate, 
        oi.name, 
        oi.imageUrl 
      FROM 
        orders o 
      LEFT JOIN 
        order_items oi 
      ON 
        o.order_id = oi.order_id 
      WHERE 
        o.order_id = ?`,
      [orderId]
    );

    if (result.length > 0) {
      const orderDetails = {
        orderInfo: {
          order_id: result[0].order_id,
          confirmation_number: result[0].confirmation_number,
          customer_id: result[0].customer_id,
          total_amount: result[0].total_amount,
          discounts_applied: result[0].discounts_applied,
          shipping_cost: result[0].shipping_cost,
          tax: result[0].tax,
          delivery_type: result[0].delivery_type,
          delivery_address: result[0].delivery_address,
          store_location: result[0].store_location,
          order_status: result[0].order_status,
          order_date: result[0].order_date,
          delivery_date: result[0].delivery_date,
        },
        orderItems: result.map(item => ({
          item_id: item.item_id,
          product_price: item.product_price,
          quantity: item.quantity,
          warranty: item.warranty,
          retailer_discount: item.retailer_discount,
          rebate: item.rebate,
          name: item.name,
          imageUrl: item.imageUrl,
        })).filter(item => item.item_id !== null) // Filter out null items
      };

      res.status(200).json(orderDetails);
    } else {
      res.status(404).json({ message: 'Order not found.' });
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
