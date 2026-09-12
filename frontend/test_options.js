import axios from 'axios';

async function testOptions() {
  try {
    const res = await axios.options('http://localhost:5000/api/v1/orders/699013c16b838192fc9ce17d/payment', {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'authorization,content-type',
      }
    });

    console.log('OPTIONS status:', res.status);
    console.log('Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('Allow-Origin:', res.headers['access-control-allow-origin']);
  } catch (err) {
    console.error('OPTIONS error:', err.response?.status, err.response?.headers, err.message);
  }
}

testOptions();
