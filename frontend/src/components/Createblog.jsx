import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './view/createblog.css';
const CreateBlog = () => {
  const { createblog } = useContext(AuthContext); 
  const navigate = useNavigate(); 
  const [error, setError] = useState(null); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const title = e.target.title.value;
    const content = e.target.content.value;
    const image = e.target.image.files[0]; 

   
    if (!image) {
      setError('Image is required to create a blog post.');
      return;
    }

    
    const isSuccess = await createblog(title, content, image);

    if (isSuccess) {
      setError('');
      setSuccessMessage('Blog post created successfully!');
      navigate('/home'); 
      setSuccessMessage('');
    }
  };

  return (
    <div className='blog'>
      <h1>Create Blog Post</h1>
      <p>Share your thoughts with the world!</p>

      {/* Display error message */}
      {error && <div className="error">{error}</div>}

      {/* Display success message */}
      {successMessage && <div className="success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input 
          type="text" 
          name="title" 
          id="title"
          required 
        />

        <label htmlFor="content">Content:</label>
        <textarea 
          name="content" 
          id="content"
          rows="5" 
          required 
        ></textarea>

        <label htmlFor="image">Image:</label>
        <input 
          type="file" 
          name="image" 
          id="image"
          accept="image/*" 
          required 
        />

        <div className='btn-container'>
          <button type='submit'>Create Blog</button>
        </div>
        <span>
          Go back to <Link to="/home">Home</Link>
        </span>
      </form>
    </div>
  );
};

export default CreateBlog;


