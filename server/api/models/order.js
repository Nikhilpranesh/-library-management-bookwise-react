const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    copyType: { type: String, enum: ['hardcopy', 'softcopy'], required: true }, // Type of copy ordered
    bookId: { type: String, required: true }, // Reference to book
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "Online Payment" },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    status: { type: String, default: "PLACED" },
    bookIds: { type: [String], required: true },
    // Delivery details for hardcopy
    deliveryAddress: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    // Copy type for the entire order
    copyType: { type: String, enum: ['hardcopy', 'softcopy'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema); 