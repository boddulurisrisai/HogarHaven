import React, { useState } from 'react';
import Header from '../components/StoreManagerHeader';
import { useProduct } from '../ProductContext'; // Import ProductContext
import './SmartDoorbell';
import './SmartDoorlock';
import './SmartLighting';
import axios from 'axios'; // Import Axios

function StoreManagerDashboard() {
  const { products, addProduct, updateProduct, removeProduct } = useProduct(); // Use products from ProductContext

  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: null, category: '', published: false });
  const [editProduct, setEditProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handler for adding a product
  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.category && newProduct.image) {
      const productData = {
        product_id: newProduct.id,
        product_name: newProduct.name,
        product_category: newProduct.category,
        product_price: newProduct.price,
        product_image: newProduct.image,
      };

      try {
        if (editProduct) {
          // Update existing product
          const response = await axios.put(`http://localhost:3030/api/products/${editProduct.name}`, productData);
          if (response.status === 200) {
            updateProduct({ ...productData, product_id: editProduct.product_id }); // Update local state
          }
        } else {
          // Add new product
          const response = await axios.post('http://localhost:3030/api/products', productData);
          if (response.status === 201) {
            addProduct({ ...productData, product_id: response.data.insertId }); // Assuming your backend returns the new ID
          }
        }
      } catch (error) {
        console.error('Error adding/updating product:', error);
      }

      // Reset the form fields
      setNewProduct({ name: '', price: '', description: '', image: null, category: '' });
      setImagePreview(null);
      setEditProduct(null);
    }
  };

  // Handler for publishing a product
  const handlePublishProduct = (productId) => {
    const productToPublish = products.find(product => product.id === productId);
    if (productToPublish) {
      updateProduct({ ...productToPublish, published: true }); // Update to publish the product
    }
  };

  // Handler for uploading product image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setNewProduct({ ...newProduct, image: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await axios.put(`http://localhost:3030/api/products/delete/${productId}`);
      if (response.status === 200) {
        // Remove product from local state after successful deletion
        removeProduct(productId); // Update local state
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handler for selecting a product to edit
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewProduct({ ...product, image: null }); // Reset form with the selected product's details
    setImagePreview(product.image);
  };

  return (
    <>
      <Header />
      <div className="store-manager-dashboard">
        <h2>Store Manager Dashboard</h2>

        {/* Add Product Form */}
        <div className="product-form">
          <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
          <input
            type="text"
            className="input-field"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Product Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <textarea
            className="input-field description-field"
            placeholder="Product Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <select
            className="input-field"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Smart Doorbells">Smart Doorbells</option>
            <option value="Smart Doorlocks">Smart Doorlocks</option>
            <option value="Smart Speakers">Smart Speakers</option>
            <option value="Smart Lightings">Smart Lightings</option>
            <option value="Smart Thermostats">Smart Thermostats</option>
            <option value="Accessories">Accessories</option>
          </select>
          <input type="file" className="file-upload" onChange={handleImageUpload} />
          {imagePreview && <img src={imagePreview} alt="Product Preview" className="image-preview" />}
          <button className="submit-button" onClick={handleAddProduct}>
            {editProduct ? 'Update Product' : 'Add Product'}
          </button>
        </div>

        {/* Product List */}
        <div className="product-list">
          <h3>Product List</h3>
          {products.map((product) => (
            <div key={product.id || product.product_id} className="product-item">
              <h4>{product.name || product.product_name}</h4>
              <p>{product.price || product.product_price}</p>
              <p>{product.description}</p>
              {(product.image || product.product_image) && <img src={product.image || product.product_image} alt={product.name} className="product-image" />}
              <button onClick={() => handleEditProduct(product)}>Edit</button>
              <button onClick={() => handleDeleteProduct(product.id || product.product_id)}>Delete</button>
              {!product.published && <button onClick={() => handlePublishProduct(product.id)}>Publish</button>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default StoreManagerDashboard;
