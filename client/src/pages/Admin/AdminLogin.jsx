import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/admin/login', credentials);
            
            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminData', JSON.stringify(response.data.admin));
                navigate('/admin/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.msg || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <h1>🔐 Admin Login</h1>
                    <p>Access the library management system</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && <div className="admin-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Enter admin username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
