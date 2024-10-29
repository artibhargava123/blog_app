
import React, { useEffect, useState } from 'react';
import './app.scss';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Dashboard, Home, Login, Register, Createblog, BlogPost, Comment ,PasswordReset,PasswordResetConfirm} from './components';

const App = () => {
  const [isAppAllowed, setIsAppAllowed] = useState(true); 

  useEffect(() => {
    if (localStorage.getItem('isAppOpen') === 'true') {
      alert('The app is already open in another tab!');
      setIsAppAllowed(false); 
    } else {
      localStorage.setItem('isAppOpen', 'true');
    }

    
    const removeFlag = () => {
      localStorage.removeItem('isAppOpen');
    };

    window.addEventListener('beforeunload', removeFlag);

  
    return () => {
      window.removeEventListener('beforeunload', removeFlag);
      localStorage.removeItem('isAppOpen'); 
    };
  }, []);


  

  // If isAppAllowed is false, don't render anything
  if (!isAppAllowed) {
    return <h1>App already open in another tab. Please use the existing tab.</h1>;
  }

  return (
    <div className="App">
      <div className="container">
        <Router>
          <AuthProvider>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  
                  <ProtectedRoute>
                    <Dashboard />

                  </ProtectedRoute>
                }
              />
              <Route path="/"  default element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
              <Route path="/passwordreset" element={<PasswordReset/>} />
              <Route path="/home" exact  element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>} />
              <Route path="/blog" element={
                  <ProtectedRoute>
                    <Createblog />
                  </ProtectedRoute>} />
              <Route path="/blogpost/:id"  element={
                  <ProtectedRoute>
                    <BlogPost />
                  </ProtectedRoute>} />
              <Route path="/blogpost/:id/delete" element={
              <ProtectedRoute>
                    <BlogPost />
                  </ProtectedRoute>} />
              <Route path="/blogpost/:id/update" element={
              <ProtectedRoute>
                    <BlogPost />
                  </ProtectedRoute>} />



              <Route path="/comment/:id" element={
              <ProtectedRoute>
                    <Comment />
                  </ProtectedRoute>} />
            </Routes>

          
          </AuthProvider>
        </Router>
      </div>
    </div>
  );
};

export default App;
