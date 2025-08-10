import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Assets/css/billing.css";

const Invoice = ({ billingId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [billingId]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/billing/${billingId}/invoice`);
      setInvoice(response.data.invoice);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically generate a PDF
    // For now, we'll just print
    window.print();
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="payment-modal">
          <div className="billing-loading">
            <div className="loader"></div>
            <h2>Loading invoice...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="modal-overlay">
        <div className="payment-modal">
          <div className="billing-loading">
            <h2>Invoice not found</h2>
            <button className="cancel-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="invoice-modal">
        <div className="modal-header">
          <h3>Invoice #{invoice.invoiceNumber}</h3>
          <div className="invoice-actions">
            <button className="action-button view-button" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button className="action-button pay-button" onClick={handleDownload}>
              📄 Download
            </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        
        <div className="invoice-content">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-logo">
              <h1>bookWise</h1>
              <p>Library Management System</p>
            </div>
            <div className="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> {formatDate(invoice.billingDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              <p><strong>Status:</strong> 
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: invoice.status === 'paid' ? '#27ae60' : 
                                   invoice.status === 'pending' ? '#f39c12' : '#e74c3c',
                    marginLeft: '0.5rem'
                  }}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="invoice-customer">
            <h3>Bill To:</h3>
            <p><strong>{invoice.customer.username}</strong></p>
            {invoice.customer.address && (
              <div>
                <p>{invoice.customer.address.street}</p>
                <p>{invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.zipCode}</p>
                <p>{invoice.customer.address.country}</p>
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="invoice-items">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.title}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span><strong>Total:</strong></span>
              <span><strong>{formatCurrency(invoice.totalAmount)}</strong></span>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="invoice-footer">
            <div className="footer-section">
              <h4>Payment Terms</h4>
              <p>Payment is due within 30 days of invoice date.</p>
              <p>Late payments may incur additional fees.</p>
            </div>
            <div className="footer-section">
              <h4>Contact Information</h4>
              <p>📧 billing@bookwise.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Library Street, Book City, BC 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
