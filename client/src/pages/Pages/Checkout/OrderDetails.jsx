import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';

const OrderDetails = ({ items, totalPrice, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setError('Please enter your delivery address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order with hardcopy details
      const orderData = {
        username: localStorage.getItem('username') || 'guest',
        bookIds: items.map(item => item._id || item.bookId),
        copyType: 'hardcopy',
        paymentMethod: 'Cash on Delivery',
        totalAmount: totalPrice,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        items: items.map(item => ({
          bookId: item._id || item.bookId,
          title: item.Title || item.title,
          price: item.Price || item.price || 0,
          copyType: 'hardcopy'
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

        // Redirect to order confirmation
        navigate(`/order/${response.data.orderId}`, { 
          state: { 
            order: response.data, 
            items,
            copyType: 'hardcopy'
          } 
        });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-bg">
      <div className="checkout-card">
        <h2 style={{ marginTop: 0 }}>Order Details - Hard Copy</h2>
        
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
                <div>{item.Title || item.title} <span style={{ color: "#777" }}>(Hard Copy)</span></div>
                <div>₹{item.Price || item.price || 0}</div>
              </React.Fragment>
            ))}
            <div style={{ borderTop: "1px solid #ddd", marginTop: "0.5rem" }} />
            <div style={{ fontWeight: 600 }}>Total</div>
            <div style={{ fontWeight: 600 }}>₹{totalPrice}</div>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <section style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Delivery Details</h3>
            
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="customerName" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Full Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="customerPhone" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="deliveryAddress" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Delivery Address *
              </label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Enter your complete delivery address"
                rows={4}
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.75rem" }}
                required
              />
            </div>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Payment Method</h3>
            <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "0.5rem", border: "1px solid #dee2e6" }}>
              <strong>Cash on Delivery (COD)</strong>
              <p style={{ margin: "0.5rem 0 0 0", color: "#6c757d" }}>
                Pay when you receive your order at your doorstep.
              </p>
            </div>
          </section>

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
              type="submit" 
              disabled={loading} 
              className="primary-btn"
            >
              {loading ? "Placing order..." : `Place order for ₹${totalPrice}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderDetails;


