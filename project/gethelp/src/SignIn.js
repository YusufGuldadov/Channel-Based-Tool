import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = ({ onSignIn }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = () => {
    // Make a request to your server's sign-in route
    fetch('http://localhost:3001/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Check the response from the server
        if (data.message === 'User authenticated successfully') {
          // Navigate to the system page upon successful sign-in
          navigate('/system');
        } else if (data.message === 'Admin') {
          navigate('/admin');
        } else {
          // Handle unsuccessful sign-in
          setErrorMessage('Username or password is incorrect.');
          onSignIn(false);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="signin-container">
      <form className="signin-form">
        <h1>Welcome to getHelp </h1>
        <p>Please sign in to continue with the system. if you do not have account please sign up </p>
        <h2>Sign In</h2>
        <form>
          <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <br />
          <button type="button" onClick={handleSignIn}>
            Sign In
          </button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;