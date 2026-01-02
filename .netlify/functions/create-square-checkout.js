const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { items, customerInfo } = JSON.parse(event.body);

    // Validate items
    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No items in cart' })
      };
    }

    // Initialize Square client
    const client = new Client({
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? Environment.Production
        : Environment.Sandbox,
      accessToken: process.env.SQUARE_ACCESS_TOKEN
    });

    // Build line items for Square
    const lineItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity.toString(),
      basePriceMoney: {
        amount: Math.round(item.price * 100), // Convert to cents
        currency: 'USD'
      }
    }));

    // Create payment link
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quickPay: {
        name: 'CanineKind Shop Order',
        priceMoney: {
          amount: Math.round(items.reduce((total, item) => total + (item.price * item.quantity), 0) * 100),
          currency: 'USD'
        },
        locationId: process.env.SQUARE_LOCATION_ID
      },
      checkoutOptions: {
        redirectUrl: `${process.env.URL || 'https://caninekind.io'}/order-confirmation`,
        askForShippingAddress: true,
        merchantSupportEmail: 'caninekindtraining@gmail.com',
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
          cashAppPay: true,
          afterpayClearpay: false
        }
      },
      prePopulatedData: customerInfo ? {
        buyerEmail: customerInfo.email,
        buyerPhoneNumber: customerInfo.phone
      } : undefined
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkoutUrl: result.paymentLink.url,
        orderId: result.paymentLink.orderId
      })
    };

  } catch (error) {
    console.error('Square Checkout Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        details: error.message
      })
    };
  }
};
