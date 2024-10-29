
import React, { useState } from 'react';
import axios from 'axios';
import './view/passwordresetconfirm.css';
import { useParams, useNavigate } from 'react-router-dom';

const PasswordResetConfirm = () => {
    const { uid, token } = useParams(); // Retrieve uid and token from URL parameters
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/password_reset_confirm/${uid}/${token}/`, {
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            setMessage(response.data.message);
           
            setTimeout(() => {
                navigate('/'); // Adjust path as necessary
            }, 2000);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error) => {
        if (error.response) {
           
            setMessage(error.response.data.error || 'An error occurred. Please try again.');
        } else if (error.request) {
            // No response was received
            setMessage('No response from the server. Please check your connection.');
        } else {
            // Something else happened
            setMessage('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div className="password-reset-container">
            <h2>Reset Your Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">New Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Reset Password'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default PasswordResetConfirm;
