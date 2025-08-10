import React, { useState } from 'react';
import '../../Assets/css/cart.css';

const CopyTypeModal = ({ onClose, onProceed, items, totalPrice }) => {
  const [selectedCopyType, setSelectedCopyType] = useState('');
  const [error, setError] = useState('');

  const handleProceed = () => {
    if (!selectedCopyType) {
      setError('Please select a copy type');
      return;
    }
    onProceed(selectedCopyType);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Copy Type</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.Title || item.title}</span>
                  <span>₹{item.Price || item.price || 0}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: ₹{totalPrice}</strong>
            </div>
          </div>

          <div className="copy-type-selection">
            <h3>Choose Copy Type</h3>
            <div className="copy-type-options">
              <div 
                className={`copy-type-option ${selectedCopyType === 'hardcopy' ? 'selected' : ''}`}
                onClick={() => setSelectedCopyType('hardcopy')}
              >
                <div className="copy-type-icon">📖</div>
                <div className="copy-type-details">
                  <h4>Hard Copy</h4>
                  <p>Physical book delivered to your address</p>
                  <ul>
                    <li>Cash on Delivery (COD)</li>
                    <li>Shipping address required</li>
                    <li>Delivery within 3-5 days</li>
                  </ul>
                </div>
              </div>

              <div 
                className={`copy-type-option ${selectedCopyType === 'softcopy' ? 'selected' : ''}`}
                onClick={() => setSelectedCopyType('softcopy')}
              >
                <div className="copy-type-icon">📄</div>
                <div className="copy-type-details">
                  <h4>Soft Copy (PDF)</h4>
                  <p>Digital PDF file for immediate download</p>
                  <ul>
                    <li>Online payment only (UPI/Card)</li>
                    <li>Instant download after payment</li>
                    <li>Available on all devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleProceed}>
            Proceed to {selectedCopyType === 'hardcopy' ? 'Order Details' : 'Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyTypeModal;
