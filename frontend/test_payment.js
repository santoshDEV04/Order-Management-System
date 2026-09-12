import axios from 'axios';

async function testPayment() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/users/login', {
      email: 'dashsantosh2004@gmail.com',
      password: 'Admin@123'
    });

    const token = loginRes.data?.message?.accessToken;
    console.log('Token acquired');

    const ordersRes = await axios.get('http://localhost:5000/api/v1/orders/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orders = ordersRes.data?.data || [];
    console.log(`Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log('No orders to test');
      return;
    }

    const testOrder = orders[0];
    console.log('Testing update payment on order:', testOrder._id, 'current method:', testOrder.paymentMethod);

    const patchRes = await axios.patch(
      `http://localhost:5000/api/v1/orders/${testOrder._id}/payment`,
      { paymentMethod: 'UPI' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('PATCH response:', patchRes.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

testPayment();
