require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const mysql = require('mysql');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

// Initialize Elasticsearch client
const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate embeddings for a given text
async function getEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

// Function to generate product records using OpenAI
async function generateProductRecords(categories) {
    const products = [];
    for (let i = 0; i < 2; i++) {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a smart home product generator. You must output product data in JSON format with the following fields: 
- name (string, required)
- price (number, required)
- category (string, required)
- description (string, required)
- image (string, required, valid URL)
- available_stock (number, required)
- on_sale (boolean, required)
- has_rebate (boolean, required)

Ensure all fields are present and valid. Missing fields are not allowed.`,
                },
                {
                    role: "user",
                    content: `Generate a product for the category: ${categories[i % categories.length]}.`,
                },
            ],
        });

        console.log('OpenAI raw response:', response.choices[0].message.content);

        try {
            const rawProduct = JSON.parse(response.choices[0].message.content);

            // Normalize inconsistent field names
            const product = {
                name: rawProduct.name || rawProduct.productName || rawProduct.product_name || 'Unnamed Product',
                price: parseFloat(
                    rawProduct.price || rawProduct.product_price || '0'
                ),
                category: rawProduct.category || rawProduct.product_category || 'Uncategorized',
                description: rawProduct.description || rawProduct.product_description || '',
                image: rawProduct.image || rawProduct.imageURL || rawProduct.product_image_url || '',
                available_stock: rawProduct.available_stock || rawProduct.availableStock || 0,
                on_sale: rawProduct.on_sale || rawProduct.onSale || false,
                has_rebate: rawProduct.has_rebate || rawProduct.hasRebate || false,
            };

            // Validate required fields
            if (!product.name.trim() || isNaN(product.price)) {
                throw new Error('Missing or invalid required fields in product.');
            }

            products.push(product);
        } catch (error) {
            console.error('Error parsing or normalizing OpenAI response:', error);
            console.error('Response content:', response.choices[0].message.content);
            continue; // Skip invalid records
        }
    }
    return products;
}
// Function to generate product_reviews using OpenAI
async function generateProductReviews(categories, productCount) {
    const reviews = [];
    for (let i = 0; i < productCount; i++) {
        for (let j = 0; j < 2; j++) { // Generate 2 reviews per product
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `You are a smart home product review generator. Generate a product review in JSON format with the following fields:
                        - productName (string, required)
                        - reviewText (string, required)
                        - rating (number, required, range 1-5)
                        - userId (string, required)
                        - reviewDate (string, required, format: YYYY-MM-DD)
                        - productCategory (string, required)
                
        Ensure that the review is negative. Only generate reviews with a rating of 3 or below. The review should reflect dissatisfaction with the product. Ensure all fields are present and valid. Missing fields are not allowed.`,
                    },
                    {
                        role: "user",
                        content: `Generate a review for a product in the category: ${categories[i % categories.length]}.`,
                    }
                ],
            });

            console.log('OpenAI raw response:', response.choices[0].message.content);

            try {
                const rawReview = JSON.parse(response.choices[0].message.content);

                // Normalize and validate fields
                const review = {
                    productName: rawReview.productName || rawReview.product_name || "Unnamed Product",
                    reviewText: rawReview.reviewText || rawReview.review_text || "No review text available",
                    rating: parseInt(rawReview.rating, 10) || 0,
                    userId: rawReview.userId || rawReview.user_id || "unknown_user",
                    reviewDate: rawReview.reviewDate || rawReview.review_date || new Date().toISOString().split("T")[0],
                    productCategory: categories[i % categories.length], // Ensure category is mapped explicitly
                };

                // Validate required fields
                if (
                    !review.productName.trim() ||
                    !review.reviewText.trim() ||
                    review.rating < 1 ||
                    review.rating > 5
                ) {
                    throw new Error("Missing or invalid required fields in review.");
                }

                reviews.push(review);
            } catch (error) {
                console.error("Error parsing or normalizing OpenAI response:", error);
                console.error("Response content:", response.choices[0].message.content);
                continue; // Skip invalid records
            }
        }
    }
    return reviews;
}

// Function to store product records in MySQL
async function storeProductsInMySQL(products, db) {
    const query = `
        INSERT INTO test_products (name, price, category, description, image, available_stock, on_sale, has_rebate)
        VALUES ?`;

    const values = products.map((product) => [
        product.name,
        product.price,
        product.category,
        product.description,
        product.image || '', // Default to empty string if no image provided
        product.available_stock || 0, // Default to 0 if not provided
        product.on_sale ? 1 : 0, // Convert boolean to 1 or 0
        product.has_rebate ? 1 : 0, // Convert boolean to 1 or 0
    ]);

    return new Promise((resolve, reject) => {
        db.query(query, [values], (err, result) => {
            if (err) {
                console.error('Error inserting products into MySQL:', err);
                reject(err);
                return;
            }
            console.log('Inserted products into MySQL:', result);
            resolve(result);
        });
    });
}

//Function to store generated reviews in MongoDb
async function storeReviewsInMongoDb(reviews, db) {
    const reviewsCollection = db.collection('test_reviews');
    try {
        const result = await reviewsCollection.insertMany(reviews);
        console.log('Inserted reviews into MongoDB:', result.insertedCount);
    } catch (error) {
        console.error('Error inserting reviews into MongoDB:', error);
        throw error;
    }
}

// Function to create Elasticsearch index if it doesn't exist
async function createIndexIfNotExists(indexName, mappings) {
    try {
        const exists = await esClient.indices.exists({ index: indexName });
        if (!exists.body) { // Fix: Check the body of the response
            console.log(`Creating index: ${indexName}`);
            await esClient.indices.create({
                index: indexName,
                body: { mappings },
            });
            console.log(`Index ${indexName} created successfully.`);
        } else {
            console.log(`Index ${indexName} already exists. Skipping creation.`);
        }
    } catch (error) {
        console.error(`Error creating or checking index: ${indexName}`, error);
        throw error;
    }
}
// Example mappings for products index
const productsMappings = {
    properties: {
        name: { type: "text" },
        price: { type: "float" },
        description: { type: "text" },
        category: { type: "keyword" },
        embedding: {
            type: "dense_vector",
            dims: 1536
        },
    },
};

// Function to index products from MySQL into Elasticsearch
async function indexProductsInElasticSearch(db) {
    const query = 'SELECT * FROM test_products';
    return new Promise((resolve, reject) => {
        db.query(query, async (err, results) => {
            if (err) {
                console.error('Error fetching products from MySQL:', err);
                reject(err);
                return;
            }

            console.log(`Found ${results.length} products in MySQL`);

            for (const product of results) {
                try {
                    // Skip records with missing or invalid names
                    if (!product.name || product.name.trim() === '') {
                        console.warn(`Skipping product with ID ${product.id} due to missing or invalid name.`);
                        continue;
                    }

                    // Generate embedding
                    const embedding = await getEmbedding(product.description || '');

                    // Index in Elasticsearch
                    await esClient.index({
                        index: 'products',
                        id: product.id,
                        body: {
                            name: product.name,
                            price: product.price,
                            description: product.description,
                            category: product.category,
                            embedding,
                        },
                    });
                    console.log(`Stored product in Elasticsearch: ${product.name}`);
                } catch (error) {
                    console.error(`Error storing product in Elasticsearch: ${product.name || 'Unnamed Product'}`, error);
                }
            }

            resolve();
        });
    });
}

//Function to index reviews to elastic search.
async function indexReviewsInElasticSearch(db) {
    const reviewsCollection = db.collection('test_reviews');

    try {
        const reviews = await reviewsCollection.find().toArray();
        console.log(`Found ${reviews.length} reviews in MongoDB`);

        for (const review of reviews) {
            const embedding = await getEmbedding(review.reviewText);

            try {
                await esClient.index({
                    index: 'product_reviews',
                    id: review._id.toString(),
                    body: {
                        productName: review.productName,
                        reviewText: review.reviewText,
                        rating: review.rating,
                        userId: review.userId,
                        reviewDate: review.reviewDate,
                        productCategory: review.productCategory,
                        ReviewEmbedding: embedding,
                    },
                });
                console.log(`Stored review in Elasticsearch for product: ${review.productName}`);
            } catch (error) {
                console.error(`Error storing review in Elasticsearch for product: ${review.productName}`, error);
            }
        }
    } catch (error) {
        console.error('Error indexing reviews:', error);
        throw error;
    }
}

const reviewsMappings = {
    properties: {
        productName: { type: "text" },
        reviewText: { type: "text" },
        rating: { type: "integer" },
        userId: { type: "keyword" },
        reviewDate: { type: "date" },
        ReviewEmbedding: {
            type: "dense_vector",
            dims: 1536,
        },
    },
};

// module.exports = {
//     generateProductRecords,
//     storeProductsInMySQL,
//     createIndexIfNotExists,
//     indexProductsInElasticSearch,
//     getEmbedding,
//     productsMappings,
//     generateProductReviews,
//     storeReviewsInMongoDb,
//     indexReviewsInElasticSearch,
//     reviewsMappings,
// };
//
// module.exports = {
//     generateProductRecords,
//     storeProductsInMySQL,
//     createIndexIfNotExists,
//     indexProductsInElasticSearch,
//     getEmbedding,
//     productsMappings,
// };

module.exports = {
    generateProductRecords,
    storeProductsInMySQL,
    createIndexIfNotExists,
    indexProductsInElasticSearch,
    getEmbedding,
    productsMappings,
    generateProductReviews,       // Ensure this is exported
    storeReviewsInMongoDb,        // Ensure this is exported
    indexReviewsInElasticSearch,  // Ensure this is exported
    reviewsMappings,              // Ensure this is exported
};
