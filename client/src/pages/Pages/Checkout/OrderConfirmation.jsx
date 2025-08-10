import React, { useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./checkout.css";

const OrderConfirmation = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const order = state?.order;
  const items = state?.items || [];
  const copyType = state?.copyType || 'hardcopy';
  const paymentCompleted = state?.paymentCompleted || false;
  const [downloading, setDownloading] = useState({});

  const handleDownload = async (bookId, bookTitle) => {
    if (downloading[bookId]) return;
    
    setDownloading(prev => ({ ...prev, [bookId]: true }));
    
    try {
      const username = localStorage.getItem('username') || 'guest';
      const response = await axios.get(`http://localhost:5000/download-pdf/${bookId}?username=${username}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bookTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Please try again later.');
    } finally {
      setDownloading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="checkout-bg">
      <div className="checkout-card">
        <h2 style={{ marginTop: 0 }}>
          {copyType === 'softcopy' && paymentCompleted 
            ? "🎉 Payment Successful! Your PDFs are ready for download."
            : "Thank you! Your order is confirmed."
          }
        </h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <strong>Order ID:</strong> {order?.orderId || id}
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <strong>Total paid:</strong> ₹{order?.totalAmount}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Copy Type:</strong> {copyType === 'softcopy' ? 'Soft Copy (PDF)' : 'Hard Copy'}
        </div>

        {copyType === 'hardcopy' && (
          <div style={{ 
            background: "#e3f2fd", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "1rem",
            border: "1px solid #2196f3"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#1976d2" }}>📦 Delivery Information</h4>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Name:</strong> {order?.customerName || 'N/A'}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Phone:</strong> {order?.customerPhone || 'N/A'}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Address:</strong> {order?.deliveryAddress || 'N/A'}
            </p>
            <p style={{ margin: "0.5rem 0 0 0", color: "#1976d2" }}>
              Your order will be delivered within 3-5 business days.
            </p>
          </div>
        )}

        <h3>Items</h3>
        {items.length === 0 ? (
          <div>No item details available.</div>
        ) : (
          <div>
            {items.map((item, index) => (
              <div key={item.bookId || item._id || index} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "1rem",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                marginBottom: "0.5rem"
              }}>
                <div>
                  <strong>{item.title || item.Title}</strong>
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    {copyType === 'softcopy' ? 'PDF Download' : 'Hard Copy'}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontWeight: "600" }}>₹{item.price || item.Price || 0}</span>
                  {copyType === 'softcopy' && paymentCompleted && (
                    <button
                      onClick={() => handleDownload(item.bookId || item._id, item.title || item.Title)}
                      disabled={downloading[item.bookId || item._id]}
                      style={{
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "500"
                      }}
                    >
                      {downloading[item.bookId || item._id] ? "Downloading..." : "📥 Download PDF"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {copyType === 'softcopy' && paymentCompleted && (
          <div style={{ 
            background: "#e8f5e8", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginTop: "1rem",
            border: "1px solid #4caf50"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#2e7d32" }}>📄 PDF Download Instructions</h4>
            <ul style={{ margin: "0", paddingLeft: "1.5rem", color: "#2e7d32" }}>
              <li>Click the "Download PDF" button next to each book</li>
              <li>PDFs will be saved to your device's default download folder</li>
              <li>You can download the PDFs multiple times</li>
              <li>Make sure you have a PDF reader installed</li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/explore" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            textDecoration: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "25px",
            fontWeight: "600",
            marginRight: "1rem"
          }}>
            Continue Browsing
          </Link>
          <Link to="/orders" style={{
            display: "inline-block",
            background: "#6c757d",
            color: "white",
            textDecoration: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "25px",
            fontWeight: "600"
          }}>
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 