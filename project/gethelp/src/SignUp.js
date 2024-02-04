import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = ({ onSignUp }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = () => {
    fetch('http://localhost:3001/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'User created and inserted into current_user table successfully') {
          navigate('/system');
        } else {
          setErrorMessage(data.error || 'Error creating user');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage('Internal Server Error');
      });
  };

  return (
    <div className="signup-container">
      <form className="signup-form">
        <h2>Sign Up</h2>
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
        <button type="button" onClick={handleSignUp}>
          Sign Up
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
      <p>
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  );
};

export default SignUp;