import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const EditBookModal = ({ book, onClose, onSuccess, adminToken }) => {
    const [bookData, setBookData] = useState({
        Title: '',
        Author: '',
        Price: '',
        Genre: '',
        Image: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (book) {
            setBookData({
                Title: book.Title || '',
                Author: book.Author || '',
                Price: book.Price || '',
                Genre: book.Genre || '',
                Image: book.Image || ''
            });
        }
    }, [book]);

    const handleChange = (e) => {
        setBookData({
            ...bookData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.put(`http://localhost:5000/admin/books/${book._id}`, bookData, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.msg || 'Failed to update book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Book</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="modal-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="Title">Book Title *</label>
                        <input
                            type="text"
                            id="Title"
                            name="Title"
                            value={bookData.Title}
                            onChange={handleChange}
                            placeholder="Enter book title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Author">Author *</label>
                        <input
                            type="text"
                            id="Author"
                            name="Author"
                            value={bookData.Author}
                            onChange={handleChange}
                            placeholder="Enter author name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Price">Price *</label>
                        <input
                            type="number"
                            id="Price"
                            name="Price"
                            value={bookData.Price}
                            onChange={handleChange}
                            placeholder="Enter book price"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Genre">Genre *</label>
                        <input
                            type="text"
                            id="Genre"
                            name="Genre"
                            value={bookData.Genre}
                            onChange={handleChange}
                            placeholder="Enter book genre"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Image">Image URL</label>
                        <input
                            type="url"
                            id="Image"
                            name="Image"
                            value={bookData.Image}
                            onChange={handleChange}
                            placeholder="Enter image URL (optional)"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookModal;
