import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const PaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSuccess }) => {
  const [method, setMethod] = useState('card'); // card, upi
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Razorpay order details from backend
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Load Razorpay Order on Open
  useEffect(() => {
    if (isOpen && totalAmount > 0) {
      const initOrder = async () => {
        setLoadingOrder(true);
        setError('');
        try {
          const res = await api.createPaymentOrder(totalAmount);
          setOrderData(res);
        } catch (err) {
          console.error('Failed to create payment order:', err);
          setError('Failed to initiate transaction. Please try again.');
        } finally {
          setLoadingOrder(false);
        }
      };
      initOrder();
    } else {
      // Reset state on close
      setOrderData(null);
      setSuccess(false);
      setProcessing(false);
      setError('');
    }
  }, [isOpen, totalAmount]);

  if (!isOpen) return null;

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!orderData) return;

    setError('');

    // Case 1: Real Razorpay mode
    if (!orderData.isMock) {
      setProcessing(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setProcessing(false);
        setError('Failed to load payment gateway checkout window.');
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NearCinema Ticket Booking',
        description: `Booking Transaction for ₹${totalAmount}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verification = await api.verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMock: false
            });

            if (verification.success) {
              setProcessing(false);
              setSuccess(true);
              setTimeout(() => {
                onPaymentSuccess();
              }, 1500);
            } else {
              setProcessing(false);
              setError('Payment verification failed.');
            }
          } catch (err) {
            setProcessing(false);
            setError(err.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: 'Nikhil V',
          email: 'nikhilv@gmail.com',
        },
        theme: {
          color: '#e11d48',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } else {
      // Case 2: Sandbox / Simulated Razorpay mode
      setProcessing(true);
      
      // Simulate network verification lag
      setTimeout(async () => {
        try {
          const verification = await api.verifyPaymentSignature({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
            razorpay_signature: 'mock_signature_123456',
            isMock: true
          });

          if (verification.success) {
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
              onPaymentSuccess();
            }, 1500);
          } else {
            setProcessing(false);
            setError('Payment verification failed.');
          }
        } catch (err) {
          setProcessing(false);
          setError(err.message || 'Simulated transaction error.');
        }
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-full animate-bounce">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
            <p className="text-slate-400 text-sm">Generating your ticket confirmation...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
                <p className="text-slate-400 text-xs mt-0.5">Razorpay Gateway Integration</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase font-bold">Total Pay</span>
                <span className="text-lg font-black text-brand-red">₹{totalAmount}</span>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}

            {loadingOrder ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="h-8 w-8 text-brand-red animate-spin" />
                <p className="text-slate-400 text-xs font-semibold">Contacting payment API...</p>
              </div>
            ) : orderData && orderData.isMock ? (
              // Sandbox Mode warning and form
              <div className="space-y-4">
                <div className="flex gap-2 items-start bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-extrabold block">Sandbox Test Mode Active</span>
                    To use real checkout, configure <strong>RAZORPAY_KEY_ID</strong> in the backend server's <code>.env</code> file.
                  </div>
                </div>

                {/* Methods selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      method === 'card'
                        ? 'bg-brand-red/10 border-brand-red text-brand-red'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <CreditCard className="h-4.5 w-4.5" />
                    Credit/Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      method === 'upi'
                        ? 'bg-brand-red/10 border-brand-red text-brand-red'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Smartphone className="h-4.5 w-4.5" />
                    UPI Payment
                  </button>
                </div>

                {processing ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <RefreshCw className="h-8 w-8 text-brand-red animate-spin" />
                    <p className="text-slate-400 text-xs font-bold">Processing simulated transaction...</p>
                  </div>
                ) : (
                  <form onSubmit={handlePay} className="space-y-4">
                    {method === 'card' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Card Number</label>
                          <input
                            type="text"
                            required
                            pattern="\d{16}"
                            maxLength="16"
                            placeholder="4111222233334444"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-900 border border-white/5 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Expiry Date</label>
                            <input
                              type="text"
                              required
                              placeholder="12/29"
                              maxLength="5"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              className="w-full bg-slate-900 border border-white/5 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">CVV</label>
                            <input
                              type="password"
                              required
                              pattern="\d{3}"
                              maxLength="3"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-900 border border-white/5 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">UPI ID</label>
                        <input
                          type="text"
                          required
                          placeholder="username@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-brand-red hover:bg-brand-red-hover active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-brand-red/20 text-sm cursor-pointer mt-4"
                    >
                      Process Simulated Pay
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // Real Razorpay button launcher
              <div className="space-y-4 py-6 text-center">
                <p className="text-slate-300 text-sm">
                  Click below to open the Razorpay secure checkout drawer.
                </p>
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 cursor-pointer text-sm"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Awaiting verification...
                    </>
                  ) : (
                    `Launch Razorpay (₹${totalAmount})`
                  )}
                </button>
              </div>
            )}

            {/* Footer lock */}
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] font-semibold border-t border-white/5 pt-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Razorpay Verified API Merchant Portal</span>
            </div>

            {/* Close button */}
            {!processing && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-lg cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
