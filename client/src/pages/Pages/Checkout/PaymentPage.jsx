import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';

const PaymentPage = ({ items, totalPrice, onBack }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
    setError('');
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value
    });
  };

  const validatePaymentDetails = () => {
    switch (paymentMethod) {
      case 'upi':
        if (!paymentDetails.upiId) {
          setError('Please enter UPI ID');
          return false;
        }
        break;
      case 'card':
        if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
          setError('Please fill in all card details');
          return false;
        }
        break;
      default:
        setError('Please select a payment method');
        return false;
    }
    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) return;

    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order with softcopy details
      const orderData = {
        username: localStorage.getItem('username') || 'guest',
        bookIds: items.map(item => item._id || item.bookId),
        copyType: 'softcopy',
        paymentMethod: paymentMethod.toUpperCase(),
        totalAmount: totalPrice,
        paymentStatus: 'completed',
        items: items.map(item => ({
          bookId: item._id || item.bookId,
          title: item.Title || item.title,
          price: item.Price || item.price || 0,
          copyType: 'softcopy'
        }))
      };

      const response = await axios.post('http://localhost:5000/order', orderData);
      
      if (response.data.orderId) {
        // Clear cart after successful order
        try {
          await axios.post('http://localhost:5000/checkout', { 
            username: localStorage.getItem('username') || 'guest' 
          });
        } catch (cartError) {
          console.error('Error clearing cart:', cartError);
        }

        // Redirect to order confirmation with download options
        navigate(`/order/${response.data.orderId}`, { 
          state: { 
            order: response.data, 
            items,
            copyType: 'softcopy',
            paymentCompleted: true
          } 
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-bg">
      <div className="checkout-card">
        <h2 style={{ marginTop: 0 }}>Payment - Soft Copy</h2>
        
        {error && (
          <div style={{ color: "#ffd1d1", background: "#5a1f1f", border: "1px solid #7a2b2b", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Order Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: "0.5rem" }}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <div>{item.Title || item.title} <span style={{ color: "#777" }}>(Soft Copy)</span></div>
                <div>₹{item.Price || item.price || 0}</div>
              </React.Fragment>
            ))}
            <div style={{ borderTop: "1px solid #ddd", marginTop: "0.5rem" }} />
            <div style={{ fontWeight: 600 }}>Total</div>
            <div style={{ fontWeight: 600 }}>₹{totalPrice}</div>
          </div>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Payment Method</h3>
          
          <div className="payment-methods">
            <div 
              className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('upi')}
            >
              <div className="payment-icon">📱</div>
              <div className="payment-details">
                <h4>UPI Payment</h4>
                <p>Pay using UPI ID or QR code</p>
              </div>
            </div>

            <div 
              className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('card')}
            >
              <div className="payment-icon">💳</div>
              <div className="payment-details">
                <h4>Credit/Debit Card</h4>
                <p>Pay using card details</p>
              </div>
            </div>
          </div>
        </section>

        {paymentMethod === 'upi' && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>UPI Details</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="upiId" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                UPI ID *
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={paymentDetails.upiId || ''}
                onChange={handlePaymentDetailsChange}
                placeholder="Enter your UPI ID (e.g., name@upi)"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
              />
            </div>
            <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "0.5rem", border: "1px solid #dee2e6" }}>
              <strong>UPI ID for testing:</strong> library@pay
            </div>
          </section>
        )}

        {paymentMethod === 'card' && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Card Details</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="cardNumber" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentDetails.cardNumber || ''}
                onChange={handlePaymentDetailsChange}
                placeholder="1234 5678 9012 3456"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label htmlFor="expiry" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiry"
                  name="expiry"
                  value={paymentDetails.expiry || ''}
                  onChange={handlePaymentDetailsChange}
                  placeholder="MM/YY"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
                />
              </div>
              <div>
                <label htmlFor="cvv" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={paymentDetails.cvv || ''}
                  onChange={handlePaymentDetailsChange}
                  placeholder="123"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
                />
              </div>
            </div>
          </section>
        )}

        <div className="checkout-actions">
          <button 
            type="button" 
            onClick={onBack} 
            className="secondary-btn"
            style={{ marginRight: "1rem" }}
          >
            Back
          </button>
          <button 
            type="button" 
            onClick={processPayment} 
            disabled={loading || !paymentMethod} 
            className="primary-btn"
          >
            {loading ? "Processing payment..." : `Pay ₹${totalPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;


