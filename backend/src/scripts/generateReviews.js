const { Configuration, OpenAI } = require('openai'); // Correct import for OpenAI
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Elasticsearch
const esClient = new Client({ node: 'http://localhost:9200' });

// Define Products and Reviews
const products = [
  {
    name: "Smart Doorbell",
    positive: ["convenient", "secure", "real-time", "reliable", "clear video"],
    negative: ["glitchy", "slow alerts", "poor connection", "privacy concerns"],
  },
  {
    name: "Smart Doorlock",
    positive: ["secure", "convenient", "remote access", "easy install"],
    negative: ["battery drain", "app issues", "unreliable", "lock jams"],
  },
  {
    name: "Smart Speaker",
    positive: ["responsive", "good sound", "versatile", "user-friendly"],
    negative: ["poor privacy", "limited commands", "connectivity issues"],
  },
  {
    name: "Smart Lighting",
    positive: ["customizable", "energy-efficient", "remote control", "mood-enhancing"],
    negative: ["app problems", "delay", "connectivity issues", "limited brightness"],
  },
  {
    name: "Smart Thermostat",
    positive: ["energy-saving", "easy to use", "efficient", "remote control"],
    negative: ["difficult setup", "temperature inaccuracy", "app bugs", "connectivity issues"],
  },
];

// Create Elasticsearch Index
async function createIndex() {
  const indexExists = await esClient.indices.exists({ index: 'product-reviews' });
  if (!indexExists) {
    await esClient.indices.create({
      index: 'product-reviews',
      body: {
        mappings: {
          properties: {
            product_name: { type: 'text' },
            review_text: { type: 'text' },
            review_vector: { type: 'dense_vector', dims: 384 }, // Updated to match text-embedding-3-small dimensions
          },
        },
      },
    });
    console.log('Index created: product-reviews');
  } else {
    console.log('Index already exists');
  }
}

// Generate and Store Reviews
async function generateAndStoreReviews() {
  for (const product of products) {
    for (let i = 0; i < 5; i++) {
      const reviewType = Math.random() > 0.5 ? 'positive' : 'negative';
      const keywords = product[reviewType].join(", ");

      try {
        const reviewResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `You are a helpful assistant generating ${reviewType} customer reviews.` },
            { role: 'user', content: `Write a ${reviewType} customer review for a ${product.name} using the following keywords: ${keywords}.` },
          ],
          max_tokens: 100,
        });

        const reviewText = reviewResponse.choices[0].message.content.trim();

        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small', // Updated model
          input: reviewText,
        });

        const embedding = embeddingResponse.data[0].embedding;

        await esClient.index({
          index: 'product-reviews',
          document: {
            product_name: product.name,
            review_text: reviewText,
            review_vector: embedding,
          },
        });

        console.log(`Stored ${reviewType} review for ${product.name}`);
      } catch (error) {
        console.error(`Error generating or storing review for ${product.name}:`, error);
      }
    }
  }
}

// Main Execution
(async () => {
  try {
    await createIndex();
    await generateAndStoreReviews();
    console.log('Reviews generated and stored successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
})();
