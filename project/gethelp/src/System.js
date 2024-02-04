import React, { useState, useEffect } from 'react';
import Channel from './Channel';
import './System.css';

const System = () => {
  const [rating, setRating] = useState(0);

  
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch('http://localhost:3001/rating');
        const data = await response.json();
        setRating(data.rating);
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    fetchRating();
  }, []); 

  
  const getUserLevel = () => {
    if (rating >= 0 && rating <= 15) {
      return 'Beginner';
    } else if (rating > 15 && rating <= 65) {
      return 'Average User';
    } else {
      return 'Expert';
    }
  };

  return (
    <div className="system-container">
      <div className="text-box"> 
      <h1>Welcome to getHelp System</h1>
      <p>This is a brief description of my system. getHelp is place where you can post or find solutions to your courses and/or assignment and also labs. You are on the main page of the getHelp system. From this window you can see already existing channels of the system and also selcet one and go to channel. Once you are in selected channel you can add new comment and also reply to alredy existing comments. You can also like/dislike comments and replies. You able to upload pictures also.
        Please make sure that you are following terms and conditions. Be aware that Admin can delete any chanel, user , comment or reply if it violtes terms and conditions of the current system. Do not post any personel information or photos. </p>
      </div>
      <Channel />

      
      <div className="rating-window">
        <p>Your Rating: {rating}</p>
        <div className="user-level">
          <p>Level: {getUserLevel()}</p>
        </div>
      </div>
    </div>
  );
};

export default System;