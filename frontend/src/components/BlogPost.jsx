import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './view/blogpost.css';

const BlogPostDetail = () => {
  const base_url=process.env.REACT_APP_BASE_URL;
  const { id } = useParams(); 
  const [blogPost, setBlogPost] = useState(null); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedPost, setUpdatedPost] = useState({ title: '', content: '', image: '' });
  const [showCommentForm, setShowCommentForm] = useState(false); // State for comment form visibility
  const [newComment, setNewComment] = useState(''); // State for new comment content
  const navigate = useNavigate();

  // Function to fetch the blog post
  const fetchBlogPost = async () => {
    try {
      const response = await axios.get(`${base_url}blog-posts/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authTokens") 
            ? JSON.parse(localStorage.getItem("authTokens")).access
            : ''}`,
        },
      });
      setBlogPost(response.data); 
      setUpdatedPost({ title: response.data.title, content: response.data.content, image: null }); 
    } catch (err) {
      setError('Failed to fetch the blog post.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchBlogPost(); 
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await axios.delete(`${base_url}blog-posts/${id}/delete/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authTokens") 
              ? JSON.parse(localStorage.getItem("authTokens")).access
              : ''}`,
          },
        });
        alert('Blog post deleted successfully!');
        navigate('/home'); 
      } catch (err) {
        setError('Failed to delete the blog post.');
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing); 
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setUpdatedPost((prev) => ({ ...prev, image: files[0] })); 
    } else {
      setUpdatedPost((prev) => ({ ...prev, [name]: value })); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', updatedPost.title);
      formData.append('content', updatedPost.content);
      if (updatedPost.image) {
        formData.append('image', updatedPost.image);
      }

      await axios.put(`${base_url}blog-posts/${id}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("authTokens") 
            ? JSON.parse(localStorage.getItem("authTokens")).access
            : ''}`,
        },
      });
      alert('Blog post updated successfully!');
      setIsEditing(false); 
      fetchBlogPost(); 
    } catch (err) {
      setError('Failed to update the blog post.');
    }
  };

  // Function to handle new comment input change
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // Function to handle comment form toggle
  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  // Function to handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${base_url}blog-posts/${id}/comments/`, {
        blog_post:Number(id),
        content: newComment,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authTokens") 
            ? JSON.parse(localStorage.getItem("authTokens")).access
            : ''}`,
        },
      });
      setNewComment(''); // Clear the comment input
      fetchBlogPost(); // Refresh the blog post to see the new comment
    } catch (err) {
      setError('Failed to add comment.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;  
  }

  if (error) {
    return <div className="error">{error}</div>;  
  }

  return (
    <div className="blog-post-detail">
      {blogPost ? (
        <>
          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={updatedPost.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Content:</label>
                <textarea
                  name="content"
                  value={updatedPost.content}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Image:</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                />
              </div>
              <button type="submit">Update Blog Post</button>
              <button type="button" onClick={handleEditToggle}>Cancel</button>
            </form>
          ) : (
            <>
              <h1>{blogPost.title}</h1>
              <p>{blogPost.content}</p>
              {blogPost.image && <img src={blogPost.image} alt={blogPost.title} />}
              <div className="btn-container">
                <button onClick={handleEditToggle}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
                <Link to="/home">Back to Home</Link>
              </div>
            </>
          )}
          <hr />
          <h2>Comments</h2>
          <button onClick={toggleCommentForm}>
            {showCommentForm ? 'Hide Comment Form' : 'Add Comment'}
          </button>
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                required
              />
              <button type="submit">Submit Comment</button>
            </form>
          )}
          <div className="comments-list">
            {/* Display existing comments here */}
          </div>
        </>
      ) : (
        <div>No blog post found.</div>
      )}
    </div>
  );
};

export default BlogPostDetail;

