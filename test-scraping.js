const axios = require('axios');

// Test script to verify scraping and database integration
async function testScraping() {
  try {
    console.log('Testing scraping with database integration...');
    
    const response = await axios.post('http://localhost:3000/api/scrape', {
      urls: ['https://example.com']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
      }
    });
    
    console.log('Scraping Response:', JSON.stringify(response.data, null, 2));
    
    // Test assets API
    console.log('\nTesting assets API...');
    const assetsResponse = await axios.get('http://localhost:3000/api/assets', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
      }
    });
    
    console.log('Assets Response:', JSON.stringify(assetsResponse.data, null, 2));
    
    // Test stats API
    console.log('\nTesting stats API...');
    const statsResponse = await axios.get('http://localhost:3000/api/assets/stats', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
      }
    });
    
    console.log('Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testScraping();
