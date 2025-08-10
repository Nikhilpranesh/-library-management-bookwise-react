import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Assets/css/billing.css";
import Invoice from "./Invoice";

const Billing = ({ user }) => {
  const [billings, setBillings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchBillingData();
  }, [user]);

  const fetchBillingData = async () => {
    try {
      const [billingsRes, paymentsRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:5000/billing/user/${user.username}`),
        axios.get(`http://localhost:5000/billing/${user.username}/payments`),
        axios.get(`http://localhost:5000/billing/${user.username}/stats`)
      ]);

      setBillings(billingsRes.data.billings || []);
      setPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.stats || {});
      setLoading(false);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      await axios.post(`http://localhost:5000/billing/${selectedBilling.billingId}/payment`, {
        ...paymentData,
        billingId: selectedBilling.billingId
      });

      setShowPaymentModal(false);
      setPaymentData({ amount: 0, paymentMethod: 'cash', notes: '' });
      fetchBillingData();
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const handleViewInvoice = (billing) => {
    setSelectedBilling(billing);
    setShowInvoiceModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'overdue': return '#e74c3c';
      default: return '#95a5a6';
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

  if (loading) {
    return (
      <div className="billing-container">
        <div className="billing-content">
          <div className="billing-loading">
            <div className="loader"></div>
            <h2>Loading billing information...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">
      <div className="billing-content">
        {/* Billing Stats */}
        <div className="billing-stats fade-in">
          <div className="stat-card">
            <div className="stat-number">{stats.totalBillings || 0}</div>
            <div className="stat-label">Total Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.paidBillings || 0}</div>
            <div className="stat-label">Paid Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingBillings || 0}</div>
            <div className="stat-label">Pending Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.overdueBillings || 0}</div>
            <div className="stat-label">Overdue Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatCurrency(stats.totalAmount || 0)}</div>
            <div className="stat-label">Total Amount</div>
          </div>
        </div>

        {/* Billing History */}
        <div className="billing-section fade-in">
          <h2 className="section-title">Billing History</h2>
          <div className="billing-list">
            {billings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No billing records found</h3>
                <p>Your billing history will appear here</p>
              </div>
            ) : (
              billings.map((billing) => (
                <div key={billing.billingId} className="billing-card">
                  <div className="billing-header">
                    <div className="billing-info">
                      <h3 className="billing-title">Invoice #{billing.invoiceNumber}</h3>
                      <p className="billing-date">Due: {formatDate(billing.dueDate)}</p>
                    </div>
                    <div className="billing-amount">
                      <span className="amount">{formatCurrency(billing.totalAmount)}</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(billing.status) }}
                      >
                        {billing.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="billing-items">
                    {billing.items.map((item, index) => (
                      <div key={index} className="billing-item">
                        <span className="item-title">{item.title}</span>
                        <span className="item-price">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="billing-actions">
                    <button 
                      className="action-button view-button"
                      onClick={() => handleViewInvoice(billing)}
                    >
                      📄 View Invoice
                    </button>
                    {billing.paymentStatus !== 'paid' && (
                      <button 
                        className="action-button pay-button"
                        onClick={() => {
                          setSelectedBilling(billing);
                          setPaymentData({ ...paymentData, amount: billing.totalAmount });
                          setShowPaymentModal(true);
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="billing-section fade-in">
          <h2 className="section-title">Payment History</h2>
          <div className="payment-list">
            {payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No payment records found</h3>
                <p>Your payment history will appear here</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.paymentId} className="payment-card">
                  <div className="payment-info">
                    <h3 className="payment-title">Receipt #{payment.receiptNumber}</h3>
                    <p className="payment-date">{formatDate(payment.paymentDate)}</p>
                    <p className="payment-method">{payment.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="payment-amount">
                    <span className="amount">{formatCurrency(payment.amount)}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.paymentStatus) }}
                    >
                      {payment.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedBilling && (
          <div className="modal-overlay">
            <div className="payment-modal">
              <div className="modal-header">
                <h3>Process Payment</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowPaymentModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="payment-details">
                  <p><strong>Invoice:</strong> #{selectedBilling.invoiceNumber}</p>
                  <p><strong>Amount Due:</strong> {formatCurrency(selectedBilling.totalAmount)}</p>
                </div>
                <div className="payment-form">
                  <div className="form-group">
                    <label>Payment Amount</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                      min="0"
                      max={selectedBilling.totalAmount}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      placeholder="Optional payment notes..."
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={handlePayment}
                  >
                    Process Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && selectedBilling && (
          <Invoice 
            billingId={selectedBilling.billingId} 
            onClose={() => setShowInvoiceModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Billing;
