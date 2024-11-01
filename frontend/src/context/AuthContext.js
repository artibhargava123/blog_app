
import { createContext, useState, useEffect } from "react";
import {jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
const swal = require('sweetalert2');
const base_url=process.env.REACT_APP_BASE_URL

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem("authTokens") ? 
        JSON.parse(localStorage.getItem("authTokens")) : null
    );

    const [user, setUser] = useState(
        localStorage.getItem("authTokens") ? 
        jwtDecode(localStorage.getItem("authTokens")) : null
    );

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loginUser = async (email, password) => {
        let url =base_url+ "token/";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));
            navigate("/home");
            swal.fire({
                title: "Login Success",
                icon: "success",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            swal.fire({
                title: "Email - Password does not exist",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const registerUser = async (full_name, email, username, password, password2) => {
        let url = base_url+"register/";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ full_name, email, username, password, password2 })
        });
        const data = await response.json();

        if (response.status === 201) {
            navigate('/');
            swal.fire({
                title: "Registration Success",
                icon: "success",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            swal.fire({
                title: "There was a server error",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        navigate('/login');
        swal.fire({
            title: "You have been logged out",
            icon: "success",
            toast: true,
            timer: 6000,
            position: 'top-right',
            timerProgressBar: true,
            showConfirmButton: false
        });
    };

    const createblog = async (title, content, image) => {
        let url = base_url+"blog/";
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', image);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authTokens?.access}`, 
            },
            body: formData,
        });

        if (response.ok) {
            swal.fire({
                title: "Blog post created successfully!",
                icon: "success",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
            return true;
        } else {
            const errorData = await response.json();
            swal.fire({
                title: errorData.detail || "Failed to create blog post",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
            return false;
        }
    };



    const createComment = async (blog_post, content) => {
        let url = base_url+`comments/`;
        const commentData = { blog_post, content}; 
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authTokens?.access}`, 
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(commentData),
        });
    
        if (response.ok) {
            const newComment = await response.json();
            swal.fire({
                title: "Comment added successfully!",
                icon: "success",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
            return newComment;
        } else {
            const errorData = await response.json();
            swal.fire({
                title: errorData.detail || "Failed to add comment",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false
            });
            return null;
        }
    };
    
    const contextData = {
        user, setUser,
        authTokens, setAuthTokens,
        registerUser, loginUser, logoutUser, createblog, createComment
    };

    useEffect(() => {
        if (authTokens) {
            setUser(jwtDecode(authTokens.access));
        }
        setLoading(false);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};



