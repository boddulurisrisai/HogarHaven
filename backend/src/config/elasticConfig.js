const { Client } = require('elasticsearch');
const client = new Client({
  node: 'http://localhost:9200',
});

module.exports = client;
