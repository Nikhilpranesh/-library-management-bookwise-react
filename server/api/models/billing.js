const mongoose = require("mongoose");

const billingItemSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, enum: ['book', 'late_fee', 'membership', 'service'] },
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    dueDate: { type: Date },
    returnDate: { type: Date },
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    billingId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    items: { type: [billingItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'online', 'bank_transfer'],
      default: 'cash'
    },
    paymentStatus: { 
      type: String, 
      enum: ['unpaid', 'paid', 'partial'],
      default: 'unpaid'
    },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    notes: { type: String, default: "" },
    invoiceNumber: { type: String, unique: true },
    billingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "USA" }
    }
  },
  { timestamps: true }
);

// Generate invoice number before saving
billingSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model("billing", billingSchema);
