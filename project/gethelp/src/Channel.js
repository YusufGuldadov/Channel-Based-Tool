import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Channel.css';

const Channel = () => {
  const [channelName, setChannelName] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    
    getAllChats();
  }, []); 

  const createChannel = async () => {
    try {
      // Send a POST request to create the chat table
      const response = await fetch('http://localhost:3001/createChatTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatTableName: channelName }),
      });

      if (response.ok) {
        console.log(`Chat table '${channelName}' created successfully`);
        
        setChannels([...channels, channelName]);
        setChannelName('');
      } else {
        console.error('Failed to create chat table:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating chat table:', error.message);
    }
  };

  const getAllChats = async () => {
    try {
      const response = await fetch('http://localhost:3001/getAllChats');

      if (response.ok) {
        const data = await response.json();
        setChannels(data.chatTables);
      } else {
        console.error('Failed to retrieve chat tables:', response.statusText);
      }
    } catch (error) {
      console.error('Error retrieving chat tables:', error.message);
    }
  };

  const goToChat = () => {
    if (selectedChannel !== null && selectedChannel < channels.length) {
      const channelToEnter = channels[selectedChannel];
      navigate(`/chat/${channelToEnter}`);
    }
  };

  const handleChannelClick = (index) => {
    setSelectedChannel(index);
  };

  const filteredChannels = channels.filter(channel =>
    channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      
      <Link to="/signin" style={{ position: 'absolute', top: 0, left: 0, margin: '10px' }}>
        <button type="button">Exit</button>
      </Link>

      <h2>Create Channel</h2>
      <form>
        <label>
          Channel Name:
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </label>
        <button type="button" onClick={createChannel}>
          Create Channel
        </button>
      </form>

      <h2>Search Channels</h2>
      <input
        type="text"
        placeholder="Search channels"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2>Channels</h2>
      <ul>
        {filteredChannels.map((channel, index) => (
          <li
            key={index}
            onClick={() => handleChannelClick(index)}
            className={selectedChannel === index ? 'selected' : ''}
          >
            {channel}
          </li>
        ))}
      </ul>

      <button type="button" onClick={goToChat} disabled={selectedChannel === null}>
        Go to Channel
      </button>
    </div>
  );
};

export default Channel;