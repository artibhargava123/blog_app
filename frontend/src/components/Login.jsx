
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './view/login.css';

const Login = () => {
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    loginUser(email, password);
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <p>Sign Into Your Account</p>

      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          required
        />

        <div className="btn-container">
          <button type="submit">Login</button>
        </div>
         <br />
        {/* Forgot Password link */}
        <div className="forgot-password-container">
          <Link to="/passwordreset">Forgot your password?</Link>
        </div>

        <span>Don't have an account? 
          <Link to="/register"> Register</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
