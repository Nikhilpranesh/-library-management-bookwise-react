const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    billingId: { type: String, required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      required: true,
      enum: ['cash', 'card', 'online', 'bank_transfer']
    },
    paymentStatus: { 
      type: String, 
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: { type: String },
    cardLast4: { type: String },
    cardBrand: { type: String },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    receiptNumber: { type: String, unique: true }
  },
  { timestamps: true }
);

// Generate receipt number before saving
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model("payment", paymentSchema);
