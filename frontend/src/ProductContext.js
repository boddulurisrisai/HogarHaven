import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create a new context for products
const ProductContext = createContext();

const updateLocalStorage = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

// Create a custom hook to use the ProductContext
export const useProduct = () => {
  return useContext(ProductContext);
};

// ProductProvider component to wrap around parts of your app that need product state
export const ProductProvider = ({ children }) => {
  // Initialize state from localStorage or use default values
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [
      // Smart Doorbells (add default products here as in the original code)
    ];
  });

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Function to add a new product
  const addProduct = (product) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to update an existing product
  const updateProduct = (updatedProduct) => {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to remove a product
  const removeProduct = (productId) => {
    const updatedProducts = products.filter(product => 
      product.id !== productId && product.product_id !== productId
    );
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to publish or unpublish a product
  const togglePublishProduct = (productId, published) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, published } : product
    );
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to add an accessory to a product
  const addAccessoryToProduct = (productId, accessory) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          accessories: [...product.accessories, accessory]
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to update an accessory in a product
  const updateAccessoryInProduct = (productId, updatedAccessory) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          accessories: product.accessories.map(accessory =>
            accessory.id === updatedAccessory.id ? updatedAccessory : accessory
          )
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  // Function to remove an accessory from a product
  const removeAccessoryFromProduct = (productId, accessoryId) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          accessories: product.accessories.filter(accessory => accessory.id !== accessoryId)
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    updateLocalStorage(updatedProducts);
  };

  return (
    <ProductContext.Provider
      value={{ 
        products, 
        addProduct, 
        updateProduct, 
        removeProduct, 
        togglePublishProduct, 
        addAccessoryToProduct, 
        updateAccessoryInProduct, 
        removeAccessoryFromProduct 
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
