import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './SignIn.js';
import SignUp from './SignUp.js';
import System from './System';
import Channel from './Channel';
import Chat from './Chat';
import Admin from './Admin.js';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignIn = (success) => {
    setIsLoggedIn(success);
  };

  const handleSignUp = (success) => {
    setIsLoggedIn(success);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <System /> : <SignIn onSignIn={handleSignIn} />} />
        <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignUp} />} />
        <Route path="/system" element={<System />} />
        <Route path="/channel/:channelName" element={<Channel />} />
        <Route path="/chat/:channelName" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
       
      </Routes>
    </Router>
  );
};

export default App;
