const Billing = require("../models/billing");
const Payment = require("../models/payment");
const User = require("../models/user");
const Book = require("../models/books");
const { generateUID } = require("./generateUID");

// Create a new billing record
const createBilling = async (req, res) => {
  try {
    const { username, items, billingAddress, notes, dueDate } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const totalPrice = item.unitPrice * item.quantity;
      subtotal += totalPrice;
      return {
        ...item,
        totalPrice
      };
    });

    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + tax;

    const billing = new Billing({
      billingId: generateUID(),
      username,
      items: processedItems,
      subtotal,
      tax,
      totalAmount,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      billingAddress,
      notes
    });

    await billing.save();
    res.status(201).json({ success: true, billing });
  } catch (error) {
    console.error("Error creating billing:", error);
    res.status(500).json({ success: false, message: "Error creating billing record" });
  }
};

// Get all billing records for a user
const getUserBillings = async (req, res) => {
  try {
    const { username } = req.params;
    const billings = await Billing.find({ username }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, billings });
  } catch (error) {
    console.error("Error fetching user billings:", error);
    res.status(500).json({ success: false, message: "Error fetching billing records" });
  }
};

// Get a specific billing record
const getBillingById = async (req, res) => {
  try {
    const { billingId } = req.params;
    const billing = await Billing.findOne({ billingId });
    
    if (!billing) {
      return res.status(404).json({ success: false, message: "Billing record not found" });
    }
    
    res.status(200).json({ success: true, billing });
  } catch (error) {
    console.error("Error fetching billing:", error);
    res.status(500).json({ success: false, message: "Error fetching billing record" });
  }
};

// Update billing status
const updateBillingStatus = async (req, res) => {
  try {
    const { billingId } = req.params;
    const { status, paymentStatus } = req.body;
    
    const billing = await Billing.findOneAndUpdate(
      { billingId },
      { status, paymentStatus },
      { new: true }
    );
    
    if (!billing) {
      return res.status(404).json({ success: false, message: "Billing record not found" });
    }
    
    res.status(200).json({ success: true, billing });
  } catch (error) {
    console.error("Error updating billing status:", error);
    res.status(500).json({ success: false, message: "Error updating billing status" });
  }
};

// Process payment
const processPayment = async (req, res) => {
  try {
    const { billingId, amount, paymentMethod, transactionId, cardLast4, cardBrand, notes } = req.body;
    
    const billing = await Billing.findOne({ billingId });
    if (!billing) {
      return res.status(404).json({ success: false, message: "Billing record not found" });
    }

    // Create payment record
    const payment = new Payment({
      paymentId: generateUID(),
      billingId,
      username: billing.username,
      amount,
      paymentMethod,
      transactionId,
      cardLast4,
      cardBrand,
      notes
    });

    await payment.save();

    // Update billing status
    const remainingAmount = billing.totalAmount - amount;
    const newPaymentStatus = remainingAmount <= 0 ? 'paid' : 'partial';
    
    billing.paymentStatus = newPaymentStatus;
    billing.status = newPaymentStatus === 'paid' ? 'paid' : billing.status;
    billing.paidDate = newPaymentStatus === 'paid' ? new Date() : billing.paidDate;
    
    await billing.save();

    res.status(200).json({ success: true, payment, billing });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Error processing payment" });
  }
};

// Get payment history for a user
const getPaymentHistory = async (req, res) => {
  try {
    const { username } = req.params;
    const payments = await Payment.find({ username }).sort({ paymentDate: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ success: false, message: "Error fetching payment history" });
  }
};

// Generate invoice
const generateInvoice = async (req, res) => {
  try {
    const { billingId } = req.params;
    const billing = await Billing.findOne({ billingId }).populate('username');
    
    if (!billing) {
      return res.status(404).json({ success: false, message: "Billing record not found" });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: billing.invoiceNumber,
      billingDate: billing.createdAt,
      dueDate: billing.dueDate,
      customer: {
        username: billing.username,
        address: billing.billingAddress
      },
      items: billing.items,
      subtotal: billing.subtotal,
      tax: billing.tax,
      discount: billing.discount,
      totalAmount: billing.totalAmount,
      status: billing.status,
      paymentStatus: billing.paymentStatus
    };

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Error generating invoice" });
  }
};

// Get overdue billings
const getOverdueBillings = async (req, res) => {
  try {
    const overdueBillings = await Billing.find({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() }
    }).sort({ dueDate: 1 });
    
    res.status(200).json({ success: true, overdueBillings });
  } catch (error) {
    console.error("Error fetching overdue billings:", error);
    res.status(500).json({ success: false, message: "Error fetching overdue billings" });
  }
};

// Calculate late fees
const calculateLateFees = async (req, res) => {
  try {
    const { billingId } = req.params;
    const billing = await Billing.findOne({ billingId });
    
    if (!billing) {
      return res.status(404).json({ success: false, message: "Billing record not found" });
    }

    const today = new Date();
    const dueDate = new Date(billing.dueDate);
    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    let lateFee = 0;
    if (daysLate > 0) {
      lateFee = Math.min(daysLate * 2, billing.totalAmount * 0.5); // $2 per day, max 50% of total
    }

    res.status(200).json({ success: true, daysLate, lateFee });
  } catch (error) {
    console.error("Error calculating late fees:", error);
    res.status(500).json({ success: false, message: "Error calculating late fees" });
  }
};

// Get billing statistics
const getBillingStats = async (req, res) => {
  try {
    const { username } = req.params;
    
    const totalBillings = await Billing.countDocuments({ username });
    const paidBillings = await Billing.countDocuments({ username, paymentStatus: 'paid' });
    const pendingBillings = await Billing.countDocuments({ username, paymentStatus: 'unpaid' });
    const overdueBillings = await Billing.countDocuments({ 
      username, 
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() }
    });
    
    const totalAmount = await Billing.aggregate([
      { $match: { username } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const stats = {
      totalBillings,
      paidBillings,
      pendingBillings,
      overdueBillings,
      totalAmount: totalAmount[0]?.total || 0
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching billing stats:", error);
    res.status(500).json({ success: false, message: "Error fetching billing statistics" });
  }
};

module.exports = {
  createBilling,
  getUserBillings,
  getBillingById,
  updateBillingStatus,
  processPayment,
  getPaymentHistory,
  generateInvoice,
  getOverdueBillings,
  calculateLateFees,
  getBillingStats
};
