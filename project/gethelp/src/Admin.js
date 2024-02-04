import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [objectId, setObjectId] = useState('');
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/getAllTables')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch tables and their content');
        }
        return response.json();
      })
      .then((data) => {
        setTables(data.tables);
      })
      .catch((error) => {
        console.error('Error fetching tables and their content:', error);
      });
  }, []);

  const handleDeleteObject = async () => {
    if (!tableName || !objectId) {
      alert('Table name and object ID are required.');
      return;
    }

    console.log('Table Name:', tableName);
    console.log('Object ID:', objectId);

    const confirmation = window.confirm(`Are you sure you want to delete an object from ${tableName} with ID ${objectId}?`);

    if (confirmation) {
      try {
        const response = await fetch(`http://localhost:3001/deleteObject/${tableName}/${objectId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Server Response:', response);

        if (!response.ok) {
          throw new Error(`Failed to delete object from ${tableName} with ID ${objectId}`);
        }

        console.log(`Object deleted successfully from ${tableName} with ID ${objectId}`);

        window.location.reload();
      } catch (error) {
        console.error('Error deleting object:', error);
      }
    }
  };

  const handleDropTable = async () => {
    if (!tableName) {
      alert('Table name is required.');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to drop the table '${tableName}'?`);

    if (confirmation) {
      try {
        const response = await fetch('http://localhost:3001/api/dropTable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableName }),
        });

        console.log('Server Response:', response);

        if (!response.ok) {
          throw new Error(`Failed to drop table '${tableName}'`);
        }

        console.log(`Table '${tableName}' dropped successfully`);

        window.location.reload();
      } catch (error) {
        console.error('Error dropping table:', error);
      }
    }
  };

  const filteredTables = tables.filter((table) =>
    table.tableName && table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExit = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="admin-container">
      <h2>Admin Page</h2>
      <input
        type="text"
        placeholder="Search tables"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="tables-list">
        <h3>All Channels, currentUser and users List:</h3>
        {filteredTables.map((table, index) => (
          <div key={index}>
            <h4>{table.tableName}</h4>
            <ul>
              {table.error ? (
                <li>{table.error}</li>
              ) : (
                table.data.map((row, rowIndex) => (
                  <li key={rowIndex}>{JSON.stringify(row)}</li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      <label>Enter channel/user Name: </label>
      <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} />

      <label>Enter user/message ID: </label>
      <input type="text" value={objectId} onChange={(e) => setObjectId(e.target.value)} />

      <button onClick={handleDeleteObject}>Delete Post</button>

    
      <button onClick={handleDropTable}>Delete Channel</button>

      <button className="exit-button" onClick={handleExit}>
        Exit
      </button>
    </div>
  );
};

export default AdminPanel;