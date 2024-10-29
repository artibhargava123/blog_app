import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './view/comment.css';

const Comment = () => {
  const { id } = useParams(); 
  const { createComment } = useContext(AuthContext); 
  const [content, setContent] = useState(''); 
  const [error, setError] = useState(null); 
  const [successMessage, setSuccessMessage] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment content is required.');
      return;
    }

    try {
     
      const newComment = await createComment({ blog_post: Number(id), content });

      if (newComment) {
        setError('');
        setSuccessMessage('Comment added successfully!');
        setContent(''); 
      }
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className='comments'>
      <h2>Add a Comment</h2>

      {/* Display error message */}
      {error && <div className="error">{error}</div>}

      {/* Display success message */}
      {successMessage && <div className="success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="content">Your Comment:</label>
        <textarea 
          name="content" 
          id="content"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)} 
          required
        ></textarea>

        <div className='btn-container'>
          <button type='submit'>Post Comment</button>
        </div>
      </form>
    </div>
  );
};

export default Comment;

