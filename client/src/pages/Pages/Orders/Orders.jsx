import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../Assets/css/orders.css";
import Footer from "../../Components/Footer";

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/orders/${user.username}`);
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "#3498db";
      case "CONFIRMED":
        return "#f39c12";
      case "SHIPPED":
        return "#9b59b6";
      case "DELIVERED":
        return "#27ae60";
      case "CANCELLED":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="orders-container">
        <div className="orders-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-content">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-content">
        <div className="orders-header fade-in">
          <div className="orders-title">📋 Your Orders</div>
          <div className="orders-subtitle">
            Track your book purchases and delivery status
          </div>
          <button 
            onClick={handleRefresh} 
            className="refresh-button"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📚</div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start exploring our collection!</p>
            <button 
              onClick={() => window.location.href = "/explore"} 
              className="explore-button"
            >
              🔍 Explore Books
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card slide-in-left">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-id">Order #{order.orderId}</div>
                    <div className="order-date">
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <div className="item-title">{item.title}</div>
                        <div className="item-details">
                          <span className="item-isbn">Book ID: {item.bookId || item._id}</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="item-price">₹{item.price}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">₹{order.totalAmount}</span>
                  </div>
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="detail-label">Payment Method:</span>
                      <span className="detail-value">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
