import React, { useContext, useEffect, useState } from 'react';
import AuthContext from "../context/AuthContext";
import './view/home.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useContext(AuthContext);

  const token = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens")).access
    : null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Show 6 posts per page

  let userId = null;
  if (user && token) {
    const decoded = jwtDecode(token);
    userId = decoded.user_id;
  }

  const fetchPosts = async (page) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/blog/?user_id=${userId}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(response.data.results);
      setTotalPosts(response.data.count);

      // Fetch comments for each post after fetching posts
      // const postsWithComments = await Promise.all(response.data.results.map(async (post) => {
      //   const comments = await fetchComments(post.id);
      //   return { ...post, comments };
      // }));
      // setPosts(postsWithComments); 
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  
  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/comments/?blog-post=${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.results; 
    } catch (err) {
      console.error(`Failed to fetch comments for post ${postId}`, err);
      return []; 
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts(currentPage);
    } else {
      setLoading(false);
    }
  }, [token, userId, currentPage]);

  const totalPages = Math.ceil(totalPosts / pageSize); // Calculate total pages

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchPosts(pageNumber);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="Home">
      <header className="header">
        <h1>Homepage</h1>
        <p>Welcome to the Homepage</p>
      </header>

      <nav className="navbar">
        {user ? (
          <>
            <span>You are logged in</span>
            <Link to="/blog">Create New Blog Post</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link onClick={logoutUser}>Logout</Link>
          </>
        ) : (
          <>
            <span>You are not logged in</span>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <main className="content">
        <h2>Blog Posts:</h2>
        {error && <div className="error">{error}</div>}
        <div className="posts-container">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="post-image"
                    onClick={() => navigate(`/blogpost/${post.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {console.log("comments",post)}
                {/* Display comments */}
                <div className="comments-section">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment.id} className="comment">
                        <p><strong>{"username"}:</strong> {comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
                <hr />
              </div>
            ))
          ) : (
            <p>No blog posts available.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          {totalPages > 1 && (
            <div className="pagination-numbers">
              <button onClick={() => handlePageClick(1)} disabled={currentPage === 1}>
                « First
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={currentPage === index + 1 ? 'active' : ''}
                  onClick={() => handlePageClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages}>
                Last »
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;




