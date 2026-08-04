import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpayInstance = null;
if (isRazorpayConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create Order API
export const createOrder = async (req, res) => {
  const { amount } = req.body;

  try {
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);

    if (isRazorpayConfigured && razorpayInstance) {
      // Real Razorpay Order
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        isMock: false
      });
    } else {
      // Mock Razorpay Order for Local Development / Sandbox Mode
      const mockOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 11)}${Date.now().toString(36)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_mock_${Date.now()}`,
        status: 'created',
      };

      return res.json({
        success: true,
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        key: 'rzp_test_mockkey12345678',
        isMock: true
      });
    }
  } catch (err) {
    console.error('Error creating payment order:', err);
    res.status(500).json({ message: 'Error initiating payment order' });
  }
};

// Verify Payment API
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  try {
    if (isMock || !isRazorpayConfigured) {
      // Test mode auto-validation
      console.log('Validating mock payment transaction...');
      return res.json({
        success: true,
        message: 'Mock payment verified successfully'
      });
    }

    // Real Razorpay verification
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      console.log(`Payment verified successfully for Order ${razorpay_order_id}`);
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      console.error('Invalid payment signature!');
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Error verifying transaction' });
  }
};
