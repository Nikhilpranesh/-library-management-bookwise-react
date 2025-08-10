const bookSchema = require("../models/books");
const userSchema = require("../models/user");
const PublicList = require("../models/publicList");
const Order = require("../models/order");
const orderSchema = require("../models/order");
const path = require("path");
const fs = require("fs");

function generateSlug(base) {
    const normalized = String(base || "list").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${normalized}-${suffix}`;
}

function generateOrderId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const t = String(now.getTime()).slice(-6);
    return `ORD-${y}${m}${d}-${t}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

exports.publishList = async (req, res) => {
    try {
        const { title, bookIds, username } = req.body || {};
        if (!title || !Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({ msg: "Title and at least one book ID are required" });
        }

        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const doc = await PublicList.create({ slug, title, ownerUsername: username || "guest", bookIds });
        res.status(200).json({ msg: "List published successfully", slug: doc.slug });
    } catch (error) {
        res.status(500).json({ msg: "Failed to publish list" });
    }
};

exports.getPublicList = async (req, res) => {
    try {
        const { slug } = req.params;
        const doc = await PublicList.findOne({ slug });
        if (!doc) {
            return res.status(404).json({ msg: "List not found" });
        }

        const books = await bookSchema.find({ _id: { $in: doc.bookIds } });
        res.status(200).json({ list: doc, books });
    } catch (error) {
        res.status(500).json({ msg: "Failed to fetch list" });
    }
};

exports.recommendations = async (req, res) => {
    try {
        const { username } = req.params;
        let preferredGenres = [];
        if (username) {
            const user = await userSchema.findOne({ username });
            if (user && Array.isArray(user.borrowed)) {
                const genreCount = {};
                for (const entry of user.borrowed) {
                    const b = await bookSchema.findOne({ ISBN: entry.isbn });
                    const g = b?.Genre;
                    if (!g) continue;
                    const genres = Array.isArray(g) ? g : [g];
                    for (const gg of genres) genreCount[gg] = (genreCount[gg] || 0) + 1;
                }
                preferredGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).map(([g]) => g).slice(0, 3);
            }
        }
        let books;
        if (preferredGenres.length > 0) {
            books = await bookSchema.find({ Genre: { $in: preferredGenres } }).limit(12);
        } else {
            books = await bookSchema.find().limit(12);
        }
        return res.status(200).json({ books });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Failed to load recommendations" });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { Title, Author, Price, Genre, Image } = req.body;

        if (!Title || !Author || !Price || !Genre) {
            return res.status(400).json({ msg: "Title, Author, Price, and Genre are required" });
        }

        // Check if book already exists by title and author
        let doc = await bookSchema.findOne({ Title: Title, Author: Author });
        if (!doc) {
            const book = new bookSchema({
                Title: Title,
                Author: Author,
                Price: Price,
                Genre: Genre,
                Image: Image || ""
            });
            await book.save();
            return res.status(200).json({ msg: "Book Added SuccessFully" });
        } else {
            return res.status(400).json({ msg: "Book with this title and author already exists" });
        }
    }
    catch (error) {
        throw error;
    }
};

// Download PDF for softcopy orders
exports.downloadPdf = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { username } = req.query;

        if (!bookId || !username) {
            return res.status(400).json({ msg: "Book ID and username are required" });
        }

        // Check if user has purchased this book as softcopy
        const order = await orderSchema.findOne({
            username: username,
            "items.bookId": bookId,
            copyType: "softcopy",
            paymentStatus: "completed"
        });

        if (!order) {
            return res.status(403).json({ msg: "You don't have permission to download this PDF" });
        }

        // Get book details
        const book = await bookSchema.findById(bookId);
        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        if (!book.pdfUrl) {
            return res.status(404).json({ msg: "PDF not available for this book" });
        }

        // Construct file path
        const filePath = path.join(__dirname, '../../', book.pdfUrl);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ msg: "PDF file not found" });
        }

        // Send file
        res.download(filePath, `${book.Title}.pdf`);
    } catch (error) {
        console.error("Download PDF error:", error);
        res.status(500).json({ msg: "Failed to download PDF" });
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await bookSchema.find();
        return res.status(200).json({ books });
    } catch (error) {
        throw error;
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const searchText = req.params.id;
        if (searchText == "-") {
            const books = await bookSchema.find();
            return res.status(200).json({ books });
        }
        const regex = new RegExp(searchText, 'i'); // 'i' flag for case-insensitive search
        const books = await bookSchema.find({
            $or: [
                { Title: { $regex: regex } },
                { Author: { $regex: regex } },
                { Genre: { $regex: regex } }
            ]
        }).limit(4);
        res.status(200).json({ books });
    } catch (error) {
        throw error;
    }
};


exports.addToCart = async (req, res) => {
    try {
        const { username, bookId, title, price } = req.body;
        
        if (!username || !bookId) {
            return res.status(400).json({ msg: "Username and book ID are required" });
        }

        const user = await userSchema.findOne({ username });

        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        // Check if book already exists in cart
        const existingCartItem = user.cart.find(item => item.bookId === bookId);
        if (existingCartItem) {
            return res.status(400).json({ msg: "Book already in cart" });
        }

        const book = await bookSchema.findById(bookId);

        if (!book) {
            return res.status(400).json({ msg: `Book not found` });
        }

        // Add book to user's cart with additional details
        user.cart.push({
            bookId: book._id,
            title: title || book.Title,
            price: price || book.Price || Math.floor(Math.random() * 500) + 100
        });
        
        await user.save();
        return res.status(200).json({ success: true, msg: "Book added to cart successfully" });
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ msg: "Failed to add book to cart" });
    }
};




exports.checkout = async (req, res) => {
    try {
        const { username } = req.body;
        console.log(username);
        const user = await userSchema.findOne({ username });

        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        const booksInCart = user.cart;
        const borrowedBooks = [];

        for (let i = 0; i < booksInCart.length; i++) {
            const bookId = booksInCart[i].bookId;
            const book = await bookSchema.findById(bookId);

            if (!book) {
                return res.status(400).json({ msg: `Book not found` });
            }

            // Add book to borrowed array
            borrowedBooks.push({
                bookId: book._id,
                title: book.Title,
                takenDate: new Date(),// Set the due date as per your requirements
            });
        }

        // Empty the user's cart and update the borrowed books
        user.cart = [];
        user.borrowed = [...user.borrowed, ...borrowedBooks];
        await user.save();

        return res.status(200).json({ msg: "Checkout successful" });
    } catch (error) {
        throw error;
    }

};

exports.returnBooks = async (req, res) => {
    try {
        const { uniqueId, isbn } = req.body;

        // Find the user
        const user = await userSchema.findOne({ uniqueId });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Find the books with the provided book IDs
        const books = await bookSchema.find({ _id: { $in: isbn } });

        if (books.length === 0) {
            return res.status(404).json({ msg: 'No books found with the provided book IDs' });
        }

        // Remove the books from the user's borrowed array
        user.borrowed = user.borrowed.filter(book => !isbn.includes(book.bookId));

        // Books are returned successfully
        // No need to track item count in simplified schema

        // Save the updated user
        await user.save();

        return res.status(200).json({ msg: 'Books returned successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
}


exports.removeFromCart = async (req, res) => {
    try {
        const { username, bookId } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ msg: 'Username and bookId are required' });
        }

        // Find the user
        const user = await userSchema.findOne({ username });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Find the index of the book in cart
        const bookIndex = user.cart.findIndex((book) => book.bookId.toString() === bookId.toString());
        
        if (bookIndex === -1) {
            return res.status(404).json({ msg: 'Book not found in cart' });
        }

        // Remove the book from the user's cart
        user.cart.splice(bookIndex, 1);

        // Save the updated user
        await user.save();

        return res.status(200).json({ msg: 'Book removed from cart successfully' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
};

exports.filter = async (req, res) => {
    try {
        const genre = req.params.genre;
        const year = req.params.year;
        const title = req.params.title;

        const query = {};

        // Apply genre filter
        if (genre !== 'all') {
            query.genre = genre;
        }

        // Apply year filter
        if (year !== 'all') {
            query.year = year;
        }

        // Apply title filter
        if (title !== 'all') {
            query.title = { $regex: title, $options: 'i' };
        }

        // Find books based on the filter criteria
        const books = await bookSchema.find(query);

        return res.status(200).json({ books });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.booksInCart = async (req, res) => {
    try {
        const username = req.params.username;

        // Find the user
        const user = await userSchema.findOne({ username });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get cart items with stored details
        const cartItems = user.cart;

        if (cartItems.length === 0) {
            return res.status(200).json({ books: [] });
        }

        // Combine cart data with book details from database
        const books = [];
        for (const cartItem of cartItems) {
            const bookDetails = await bookSchema.findById(cartItem.bookId);
            if (bookDetails) {
                books.push({
                    _id: bookDetails._id,
                    bookId: cartItem.bookId,
                    title: cartItem.title || bookDetails.Title,
                    author: bookDetails.Author,
                    genre: bookDetails.Genre,
                    price: cartItem.price || bookDetails.Price || Math.floor(Math.random() * 500) + 100,
                    image: bookDetails.Image || `https://picsum.photos/seed/${bookDetails.Title}/240/340`
                });
            }
        }

        // Send the combined book details to the client
        return res.status(200).json({ books });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
};
exports.borrowedBooks = async (req, res) => {
    try {
        const users = await userSchema.find({ borrowed: { $exists: true, $ne: [] } });

        if (users.length === 0) {
            return res.status(404).json({ msg: "No borrowed books found" });
        }

        const borrowedBooks = [];

        for (const user of users) {
            for (const book of user.borrowed) {
                const borrowedBook = {
                    bookId: book.bookId,
                    title: "",
                    author: "",
                    uid: user.uniqueId,
                    borrower: user.name,
                    takenDate: book.takenDate,
                };

                const bookDetails = await bookSchema.findById(book.bookId);
                console.log(bookDetails);
                if (bookDetails) {
                    borrowedBook.title = bookDetails.Title;
                    borrowedBook.author = bookDetails.Author;
                } else {
                    borrowedBook.title = "Unknown";
                    borrowedBook.author = "Unknown";
                }

                borrowedBooks.push(borrowedBook);
            }
        }

        return res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}

// seedDemo function removed - no longer needed with simplified schema

exports.getPrices = async (req, res) => {
    try {
        const { isbns } = req.body || {};
        if (!Array.isArray(isbns) || isbns.length === 0) {
            return res.status(400).json({ msg: "isbns[] required" });
        }
        const books = await bookSchema.find({ ISBN: { $in: isbns } });
        // Simple mock pricing: base 399 + length variance
        const prices = books.map((b) => ({
            isbn: b.ISBN,
            title: b.Title,
            price: 399 + (b.Title?.length || 0),
        }));
        return res.status(200).json({ prices });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Failed to fetch prices" });
    }
};

exports.placeOrder = async (req, res) => {
    try {
        const { 
            username, 
            bookIds, 
            paymentMethod, 
            copyType,
            customerName,
            customerPhone,
            deliveryAddress,
            totalAmount,
            paymentStatus = 'pending'
        } = req.body;

        if (!username || !Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({ msg: "username and bookIds[] required" });
        }

        const books = await bookSchema.find({ _id: { $in: bookIds } });
        if (books.length === 0) {
            return res.status(400).json({ msg: "No books found for purchase" });
        }

        const items = books.map((book) => ({
            bookId: book._id.toString(),
            title: book.Title,
            price: book.Price,
            quantity: 1,
            copyType: copyType || 'hardcopy'
        }));

        const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderId = generateOrderId();

        const orderData = {
            orderId,
            username,
            items,
            totalAmount: totalAmount || calculatedTotal,
            paymentMethod: paymentMethod || "Online Payment",
            paymentStatus,
            bookIds,
            copyType: copyType || 'hardcopy',
            customerName,
            customerPhone,
            deliveryAddress
        };

        const order = await orderSchema.create(orderData);
        
        return res.status(200).json({ 
            orderId: order.orderId, 
            totalAmount: order.totalAmount, 
            status: order.status,
            copyType: order.copyType,
            paymentStatus: order.paymentStatus
        });
    } catch (error) {
        console.error("Place order error:", error);
        return res.status(500).json({ msg: "Failed to place order" });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ msg: "username required" });
        }
        const orders = await Order.find({ username }).sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Failed to fetch orders" });
    }
};

// Seed demo books for testing
exports.seedBooks = async (req, res) => {
    try {
        // Check if books already exist
        const existingBooks = await bookSchema.countDocuments();
        if (existingBooks > 0) {
            return res.status(200).json({ msg: "Books already exist in database" });
        }

        const demoBooks = [
            {
                Title: "The Great Gatsby",
                Author: "F. Scott Fitzgerald",
                Genre: "Classic",
                Price: 299,
                Image: "https://picsum.photos/seed/gatsby/240/340",
                Description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan."
            },
            {
                Title: "To Kill a Mockingbird",
                Author: "Harper Lee",
                Genre: "Classic",
                Price: 249,
                Image: "https://picsum.photos/seed/mockingbird/240/340",
                Description: "The story of young Scout Finch and her father Atticus in a racially divided Alabama town."
            },
            {
                Title: "1984",
                Author: "George Orwell",
                Genre: "Dystopian",
                Price: 199,
                Image: "https://picsum.photos/seed/1984/240/340",
                Description: "A dystopian novel about totalitarianism and surveillance society."
            },
            {
                Title: "Pride and Prejudice",
                Author: "Jane Austen",
                Genre: "Romance",
                Price: 179,
                Image: "https://picsum.photos/seed/pride/240/340",
                Description: "The story of Elizabeth Bennet and Mr. Darcy in Georgian-era England."
            },
            {
                Title: "The Hobbit",
                Author: "J.R.R. Tolkien",
                Genre: "Fantasy",
                Price: 399,
                Image: "https://picsum.photos/seed/hobbit/240/340",
                Description: "Bilbo Baggins embarks on an adventure with thirteen dwarves to reclaim their homeland."
            }
        ];

        await bookSchema.insertMany(demoBooks);
        return res.status(201).json({ msg: "Demo books seeded successfully", count: demoBooks.length });
    } catch (error) {
        console.error("Error seeding books:", error);
        return res.status(500).json({ msg: "Failed to seed books" });
    }
};