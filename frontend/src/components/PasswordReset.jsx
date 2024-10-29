import React, { useState } from 'react';
import axios from 'axios';
import './view/passwordreset.css';
const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); 
        setLoading(true); 

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/password_reset/', { email }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleError = (error) => {
        if (error.response) {
            // Server response errors
            setMessage(error.response.data.detail || 'An error occurred. Please try again.');
        } else if (error.request) {
            // Request made but no response received
            setMessage('No response from the server. Please check your connection.');
        } else {
            // Something else happened
            setMessage('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div>
            <h2>Password Reset</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Password Reset Email'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PasswordReset;
