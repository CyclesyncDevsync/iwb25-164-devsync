// Simple Node.js script to test the auction API with axios
const axios = require('axios');

const AUCTION_API_URL = 'http://localhost:8096/api/auction';

// Create axios instance with same configuration as frontend
const auctionApi = axios.create({
  baseURL: AUCTION_API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

async function testAuctionAPI() {
  try {
    console.log('Testing auction API...');
    console.log('Base URL:', AUCTION_API_URL);
    console.log('Full URL:', `${AUCTION_API_URL}/auctions`);
    
    const response = await auctionApi.get('/auctions');
    console.log('Success! Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing auction API:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAuctionAPI();