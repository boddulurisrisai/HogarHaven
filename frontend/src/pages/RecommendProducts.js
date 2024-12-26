import React, { useState } from "react";
import axios from "axios";
import Header from '../components/LoginHeader';

const RecommendProducts = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchProducts = async () => {
    if (!query.trim()) {
      setError("Search query cannot be empty.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Sending the search query in the request body
      const response = await axios.post("http://localhost:3031/api/search-products", {
        query, // Send query in the request body
      });

      setProducts(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <div className="recommend-products-container">
      <h1>Recommend Products</h1>
      <div className="search-input">
        <input
          type="text"
          placeholder="Enter a product name or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchProducts}>Recommend</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      <div className="products-list">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="product-card">
              <p><strong>Product Name: </strong>{product.name}</p>
              <p><strong>Product Price: </strong> ${product.price.toFixed(2)}</p>
              <p><strong>Product Category: </strong> {product.category}</p>
              <p><strong>Product Description: </strong> {product.description}</p>
            </div>
          ))
        ) : (
          !loading
        )}
      </div>
    </div>
    </>
  );
};

export default RecommendProducts;
