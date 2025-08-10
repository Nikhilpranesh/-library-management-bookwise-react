const adminSchema = require("../models/admin");
const bookSchema = require("../models/books");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for PDF upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/pdfs';
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: "Username and password are required" });
        }

        const admin = await adminSchema.findOne({ username });
        if (!admin) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: "admin" },
            process.env.JWT_SECRET || "admin_secret_key",
            { expiresIn: "24h" }
        );

        res.status(200).json({
            msg: "Login successful",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ msg: "Login failed" });
    }
};

// Verify admin token middleware
exports.verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ msg: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "admin_secret_key");
        if (decoded.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin privileges required." });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ msg: "Invalid token" });
    }
};

// Upload PDF
exports.uploadPdf = [
    upload.single('pdf'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ msg: "No PDF file uploaded" });
            }

            const pdfUrl = `/uploads/pdfs/${req.file.filename}`;
            res.status(200).json({ msg: "PDF uploaded successfully", pdfUrl });
        } catch (error) {
            console.error("PDF upload error:", error);
            res.status(500).json({ msg: "Failed to upload PDF" });
        }
    }
];

// Add new book
exports.addBook = async (req, res) => {
    try {
        const { Title, Author, Price, Genre, Image, pdfUrl, copyType } = req.body;

        if (!Title || !Author || !Price || !Genre) {
            return res.status(400).json({ msg: "Title, Author, Price, and Genre are required" });
        }

        // Check if book already exists by title and author
        const existingBook = await bookSchema.findOne({ Title, Author });
        if (existingBook) {
            return res.status(400).json({ msg: "Book with this title and author already exists" });
        }

        const newBook = new bookSchema({
            Title,
            Author,
            Price,
            Genre,
            Image: Image || "",
            pdfUrl: pdfUrl || "",
            copyType: copyType || "hardcopy"
        });

        await newBook.save();
        res.status(201).json({ msg: "Book added successfully", book: newBook });
    } catch (error) {
        console.error("Add book error:", error);
        res.status(500).json({ msg: "Failed to add book" });
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await bookSchema.find().sort({ createdAt: -1 });
        res.status(200).json({ books });
    } catch (error) {
        console.error("Get books error:", error);
        res.status(500).json({ msg: "Failed to fetch books" });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const book = await bookSchema.findByIdAndUpdate(id, updateData, { new: true });
        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        res.status(200).json({ msg: "Book updated successfully", book });
    } catch (error) {
        console.error("Update book error:", error);
        res.status(500).json({ msg: "Failed to update book" });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await bookSchema.findByIdAndDelete(id);
        
        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        // Delete associated PDF file if it exists
        if (book.pdfUrl && book.pdfUrl.startsWith('/uploads/')) {
            const pdfPath = path.join(__dirname, '../../', book.pdfUrl);
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        }

        res.status(200).json({ msg: "Book deleted successfully" });
    } catch (error) {
        console.error("Delete book error:", error);
        res.status(500).json({ msg: "Failed to delete book" });
    }
};
