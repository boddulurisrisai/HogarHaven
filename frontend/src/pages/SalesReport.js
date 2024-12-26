import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Header from '../components/StoreManagerHeader';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Custom plugin to draw labels on top of bars
const annotationPlugin = {
    id: 'annotation',
    afterDatasetsDraw: (chart) => {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        
        data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                ctx.fillText(value, bar.x, bar.y - 5); // Draw label above the bar
            });
        });
        
        ctx.restore();
    },
};

function SalesReport() {
    const [productsSold, setProductsSold] = useState([]);
    const [dailySales, setDailySales] = useState([]);
    const chartRef = useRef(null); // Create a ref for the chart

    useEffect(() => {
        const fetchProductsSold = async () => {
            try {
                const response = await axios.get('http://localhost:3030/api/sales/products');
                setProductsSold(response.data);
            } catch (error) {
                console.error('Error fetching products sold:', error);
            }
        };

        const fetchDailySales = async () => {
            try {
                const response = await axios.get('http://localhost:3030/api/sales/daily');
                setDailySales(response.data);
            } catch (error) {
                console.error('Error fetching daily sales:', error);
            }
        };

        fetchProductsSold();
        fetchDailySales();
    }, []);

    const getColor = (sales) => {
        if (sales > 1000) return 'rgba(75, 192, 192, 0.6)'; // High sales
        if (sales > 500) return 'rgba(255, 206, 86, 0.6)'; // Medium sales
        return 'rgba(255, 99, 132, 0.6)'; // Low sales
    };

    const chartData = {
        labels: productsSold.map((product) => product.product_name),
        datasets: [
            {
                label: 'Total Sales',
                data: productsSold.map((product) => Number(product.totalSales) || 0),
                backgroundColor: productsSold.map((product) => getColor(Number(product.totalSales) || 0)), // Dynamic colors
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Sales Report',
            },
        },
    };

    // Function to format the date from ISO format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options); // Locale-specific date formatting
    };

    return (
        <>
            <Header />
            <div className="sales-report">
                <h2>Sales Report</h2>
                <h3>Products Sold</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Product Price</th>
                            <th>Quantity Sold</th>
                            <th>Total Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsSold.map((product, index) => (
                            <tr key={index}>
                                <td>{product.product_name}</td>
                                <td>{Number(product.product_price).toFixed(2) || 'N/A'}</td>
                                <td>{product.totalSold}</td>
                                <td>{Number(product.totalSales).toFixed(2) || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3>Sales Bar Chart</h3>
                <Bar
                    ref={chartRef} // Attach the ref to the Bar component
                    data={chartData}
                    options={options}
                    plugins={[annotationPlugin]}
                />

                <h3>Daily Sales</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Total Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailySales.map((dailySale, index) => (
                            <tr key={index}>
                                <td>{formatDate(dailySale.sale_date)}</td> {/* Format date */}
                                <td>{Number(dailySale.totalSales).toFixed(2) || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default SalesReport;
