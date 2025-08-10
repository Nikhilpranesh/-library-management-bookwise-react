import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import './admin.css';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const adminToken = localStorage.getItem('adminToken');
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

    useEffect(() => {
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchBooks();
    }, [adminToken, navigate]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/admin/books', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setBooks(response.data.books || []);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                navigate('/admin/login');
            } else {
                setError('Failed to fetch books');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchBooks();
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/admin/books/search?query=${searchQuery}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setBooks(response.data.books || []);
        } catch (error) {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/admin/books/${bookId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            fetchBooks();
        } catch (error) {
            setError('Failed to delete book');
        }
    };

    const handleEditBook = (book) => {
        setSelectedBook(book);
        setShowEditModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    if (loading && books.length === 0) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading books...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>📚 Admin Dashboard</h1>
                    <p>Welcome back, {adminData.username}!</p>
                </div>
                <div className="admin-header-right">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="admin-controls">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search books by title, author, or genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="admin-search-input"
                    />
                    <button onClick={handleSearch} className="admin-search-btn">
                        🔍 Search
                    </button>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)} 
                    className="admin-add-btn"
                >
                    ➕ Add New Book
                </button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Books</h3>
                    <p>{books.length}</p>
                </div>
            </div>

            <div className="books-table-container">
                <div className="books-grid">
                    {books.map((book) => (
                        <div key={book._id} className="book-card">
                            <div className="book-image">
                                {book.Image ? (
                                    <img src={book.Image} alt={book.Title} />
                                ) : (
                                    <div className="book-placeholder">📚</div>
                                )}
                            </div>
                            <div className="book-info">
                                <h3 className="book-title">{book.Title}</h3>
                                <p className="book-author">by {book.Author}</p>
                                <p className="book-genre">{book.Genre}</p>
                                <p className="book-price">₹{book.Price}</p>
                            </div>
                            <div className="book-actions">
                                <button 
                                    className="btn-edit" 
                                    onClick={() => handleEditBook(book)}
                                >
                                    ✏️ Edit
                                </button>
                                <button 
                                    className="btn-delete" 
                                    onClick={() => handleDeleteBook(book._id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAddModal && (
                <AddBookModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchBooks();
                    }}
                    adminToken={adminToken}
                />
            )}

            {showEditModal && selectedBook && (
                <EditBookModal
                    book={selectedBook}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedBook(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedBook(null);
                        fetchBooks();
                    }}
                    adminToken={adminToken}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
