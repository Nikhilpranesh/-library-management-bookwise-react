import React, { useState } from 'react';
import axios from 'axios';
import './admin.css';

const AddBookModal = ({ onClose, onSuccess, adminToken }) => {
    const [bookData, setBookData] = useState({
        Title: '',
        Author: '',
        Price: '',
        Genre: '',
        Image: '',
        pdfUrl: '',
        copyType: 'hardcopy'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfFile, setPdfFile] = useState(null);

    const handleChange = (e) => {
        setBookData({
            ...bookData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            alert('Please select a valid PDF file');
        }
    };

    const uploadPdf = async (file) => {
        if (!file) return '';
        
        const formData = new FormData();
        formData.append('pdf', file);
        
        try {
            const response = await axios.post('http://localhost:5000/admin/upload-pdf', formData, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.pdfUrl;
        } catch (error) {
            console.error('PDF upload error:', error);
            throw new Error('Failed to upload PDF');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let pdfUrl = '';
            if (pdfFile) {
                pdfUrl = await uploadPdf(pdfFile);
            }

            const response = await axios.post('http://localhost:5000/admin/books', 
                { ...bookData, pdfUrl }, 
                {
                    headers: { Authorization: `Bearer ${adminToken}` }
                }
            );
            
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.msg || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Book</h2>
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
                        <label htmlFor="copyType">Copy Type *</label>
                        <select
                            id="copyType"
                            name="copyType"
                            value={bookData.copyType}
                            onChange={handleChange}
                            required
                        >
                            <option value="hardcopy">Hard Copy Only</option>
                            <option value="softcopy">Soft Copy Only</option>
                            <option value="both">Both Hard & Soft Copy</option>
                        </select>
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

                    {bookData.copyType !== 'hardcopy' && (
                        <div className="form-group">
                            <label htmlFor="pdfFile">PDF File *</label>
                            <input
                                type="file"
                                id="pdfFile"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required={bookData.copyType !== 'hardcopy'}
                            />
                            <small>Upload PDF file for soft copy availability</small>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBookModal;
