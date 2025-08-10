const router = require("express").Router();

const userController = require("../controller/userAPI");
const bookController = require("../controller/bookAPI");
const billingController = require("../controller/billingAPI");
const adminController = require("../controller/adminAPI");

// User API - only functions that exist
router.get("/allUser", userController.allUser);
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/user/:username", userController.userDetail);
router.get("/logedinuser", userController.userDetails); // Add this route for checking logged in user
router.post("/logout", userController.logout); // Add logout route

// Book API - only functions that exist
router.post("/addBook", bookController.addBook);
router.get("/allBooks", bookController.getAllBooks);
router.get("/searchBooks/:id", bookController.searchBooks);
router.get("/download-pdf/:bookId", bookController.downloadPdf);
router.post("/publishList", bookController.publishList);
router.get("/publicList/:slug", bookController.getPublicList);
router.get("/recommendations/:username", bookController.recommendations);
router.get("/filter", bookController.filter);
router.get("/getPrices", bookController.getPrices);
router.post("/seed", bookController.seedBooks); // Add seed route for demo books

// Cart and checkout - only functions that exist
router.post("/addToCart", bookController.addToCart);
router.get("/booksInCart/:username", bookController.booksInCart);
router.post("/removeFromCart", bookController.removeFromCart);
router.post("/checkout", bookController.checkout);
router.get("/userBooks/:username", bookController.borrowedBooks);
router.post("/returnBooks", bookController.returnBooks);

// Order API - only functions that exist
router.post("/order", bookController.placeOrder);
router.get("/orders/:username", bookController.getUserOrders);

// Billing API - only functions that exist
router.post("/billing", billingController.createBilling);
router.get("/billing/:username", billingController.getUserBillings);
router.post("/payment", billingController.processPayment);

// Admin API - only functions that exist
router.post("/admin/login", adminController.adminLogin);
router.post("/admin/upload-pdf", adminController.verifyAdminToken, adminController.uploadPdf);
router.post("/admin/books", adminController.verifyAdminToken, adminController.addBook);
router.get("/admin/books", adminController.verifyAdminToken, adminController.getAllBooks);
router.put("/admin/books/:id", adminController.verifyAdminToken, adminController.updateBook);
router.delete("/admin/books/:id", adminController.verifyAdminToken, adminController.deleteBook);

module.exports = router;