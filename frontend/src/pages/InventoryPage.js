/* global google */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/StoreManagerHeader';

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [productsWithRebates, setProductsWithRebates] = useState([]);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load Google Charts
  useEffect(() => {
    const loadGoogleCharts = () => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = () => {
        google.charts.load('current', { packages: ['bar'] });
        google.charts.setOnLoadCallback(() => setGoogleLoaded(true));
      };
      document.body.appendChild(script);
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/inventory');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchProductsOnSale = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/sale');
        setProductsOnSale(response.data);
      } catch (error) {
        console.error('Error fetching products on sale:', error);
      }
    };

    const fetchProductsWithRebates = async () => {
      try {
        const response = await axios.get('http://localhost:3030/api/products/rebates');
        setProductsWithRebates(response.data);
      } catch (error) {
        console.error('Error fetching products with rebates:', error);
      }
    };

    fetchProducts();
    fetchProductsOnSale();
    fetchProductsWithRebates();
    loadGoogleCharts();
  }, []);

  // Use useEffect to draw charts once data is available and google charts are loaded
  useEffect(() => {
    if (googleLoaded && products.length > 0) {
      drawInventoryChart();
    }
  }, [googleLoaded, products]);

  const drawInventoryChart = () => {
    const data = google.visualization.arrayToDataTable([
      ['Product', 'Price', 'Available Quantity'],
      ...products.map((product) => [
        product.product_name,
        Number(product.product_price), // Ensure price is a number
        product.available_quantity,
      ]),
    ]);

    const options = {
      chart: {
        title: 'Product Inventory',
        subtitle: 'Price and No Of Items Available',
      },
      bars: 'horizontal',
      hAxis: {
        format: 'decimal',
        title: 'Price',
      },
      vAxis: {
        title: 'Products',
        textStyle: {
          fontSize: 12, // Adjust font size if needed
        },
        gridlines: {
          count: products.length, // Increase gridlines to match products count
        },
      },
      height: Math.max(products.length * 40, 400), // Adjust height based on number of products, minimum 400px
      colors: ['#1b9e77', '#d95f02'],
      legend: { position: 'none' }, // Hide legend if not necessary
    };

    const chart = new google.charts.Bar(document.getElementById('inventory_chart_div'));
    chart.draw(data, google.charts.Bar.convertOptions(options));
  };

  // Function to render a table
  const renderTable = (products, tableClass) => {
    return (
        
      <table className={tableClass}>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Available Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.product_name}</td>
              <td>{Number(product.product_price).toFixed(2)}</td> {/* Ensure price is formatted */}
              <td>{product.available_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
    <Header />
    <div className="inventory-page">
      <h2>Inventory Page</h2>

      {/* Bar chart for All Products */}
      <h3>Product Inventory Chart</h3>
      <div
        id="inventory_chart_div"
        style={{ width: '100%', height: 'auto', marginBottom: '20px' }} // Adjusted margin
      ></div>

      {/* Legend for chart colors */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#1b9e77', marginRight: '5px' }}></span>
        <span>Price</span>
        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#d95f02', margin: '0 10px 0 20px' }}></span>
        <span>No Of Items Available</span>
      </div>

      {/* All Products Table */}
      <h3>All Products Table</h3>
      {renderTable(products, 'all-products-table')}

      {/* Products on Sale Table */}
      <h3>Products on Sale Table</h3>
      {renderTable(productsOnSale, 'products-on-sale-table')}

      {/* Products with Rebates Table */}
      <h3>Products with Rebates Table</h3>
      {renderTable(productsWithRebates, 'products-with-rebates-table')}
    </div>
    </>
  );
}

export default InventoryPage;
