const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse request body
  const { sourceId, amount, customer, items, notes } = JSON.parse(event.body);

  // Initialize Square client
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox // Change to Environment.Production for live
  });

  try {
    // Create payment
    const { result } = await client.paymentsApi.createPayment({
      sourceId: sourceId,
      amountMoney: {
        amount: amount, // Amount in cents
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${Math.random()}`,
      note: notes || 'CanineKind Shop Order',
      buyerEmailAddress: customer.email,
      // Optional: Add more customer details
      ...(customer.name && {
        note: `Customer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone || 'N/A'}\nAddress: ${customer.address || 'N/A'}\nNotes: ${notes || 'None'}\n\nItems:\n${items.map(item => `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`).join('\n')}`
      })
    });

    // Payment successful
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        payment: result.payment
      })
    };

  } catch (error) {
    console.error('Payment error:', error);
    
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Payment failed'
      })
    };
  }
};
