import React, { useEffect, useState } from 'react';
import Header from '../components/LoginHeader';

const TrendingPage = () => {
    const [trendingData, setTrendingData] = useState({
        mostLikedProducts: [],
        topZipCodes: [],
        mostSoldProducts: [],
    });

    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                const response = await fetch('http://localhost:3030/api/trending');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                setTrendingData({
                    mostLikedProducts: data.mostLikedProducts,
                    topZipCodes: data.topZipCodes,
                    mostSoldProducts: data.mostSoldProducts,
                });
            } catch (error) {
                console.error('Failed to fetch:', error);
            }
        };
        fetchTrendingData();
    }, []);

    return (
        <>
        <Header />
        <div className="trending-page">
            {/* Total Trending Products Heading */}
            <h1 className="total-trending-products">Total Trending Products</h1>

            {/* Section for Most Liked Products */}
            <div className="trending-section">
                <h2>Top Five Most Liked Products</h2>
                <ul>
                    {trendingData.mostLikedProducts.map((product, index) => (
                        <li key={index}>
                            <div className="badge mostLikedBadge">{index + 1}</div>
                            <span className="product-name">{product._id}</span>
                            <span className="likes">{product.totalLikes} Likes</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Section for Top Zip Codes */}
            <div className="trending-section">
                <h2>Top Five Zip Codes with Maximum Products Sold</h2>
                <ul>
                    {trendingData.topZipCodes.map((zipCode, index) => (
                        <li key={index}>
                            <div className="badge topZipBadge">{index + 1}</div>
                            <span className="product-name">{zipCode._id}</span>
                            <span className="products-sold">{zipCode.totalSold} Products Sold</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Section for Most Sold Products */}
            <div className="trending-section">
                <h2>Top Five Most Sold Products</h2>
                <ul>
                    {trendingData.mostSoldProducts.map((product, index) => (
                        <li key={index}>
                            <div className="badge mostSoldBadge">{index + 1}</div>
                            <span className="product-name">{product._id}</span>
                            <span className="products-sold">{product.totalSold} Sold</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </>
    );
};

export default TrendingPage;
