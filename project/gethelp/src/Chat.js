import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Chat.css';

const Comment = ({ comment, onReply }) => {
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const handleReply = () => {
    onReply(comment.id, replyText, replyImage);
    setReplyText('');
    setReplyImage(null);
  };

  const handleLike = () => {
    setLikes(likes + 1);
  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
  };

  return (
    <div className="comment-container">
      <p className="comment-text">
        <strong>{comment.user.name}: </strong>
        {comment.text}
      </p>
      {comment.image && <img src={comment.image} alt="Comment" className="comment-image" />}
      <div className="reaction-buttons">
        <button className="like-button" onClick={handleLike}>
          👍 {likes}
        </button>
        <button className="dislike-button" onClick={handleDislike}>
          👎 {dislikes}
        </button>
      </div>
      <button className="reply-button" onClick={handleReply}>
        Reply
      </button>
      {comment.replies && (
        <div style={{ marginLeft: '20px' }}>
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
      <input
        className="reply-input"
        type="text"
        placeholder="Reply to this Post"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <input
        className="image-input"
        type="file"
        accept="image/*"
        onChange={(e) => setReplyImage(e.target.files[0])}
      />
    </div>
  );
};

const Chat = () => {
  const { channelName } = useParams();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [currentUser, setCurrentUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    fetch('http://localhost:3001/currentUser')
      .then(response => response.json())
      .then(data => setCurrentUser(data.currentUser))
      .catch(error => console.error('Error fetching current user:', error));

    setComments([
      { id: 1, text: 'Welcome to the chat! \n Please insure that you are following terms and conditions. Do not post personel information or photos. Please read terms and conditions before posting something. Admin has rights do delete whole chat if terms and conditions have been violated', image: null, replies: [], user: { name: 'Admin' }, likes: 0, dislikes: 0 },
    ]);
  }, [channelName]);

  const handleAddComment = () => {
    setComments([
      ...comments,
      {
        id: comments.length + 1,
        text: commentText,
        image: commentImage,
        replies: [],
        user: { name: currentUser },
        likes: 0,
        dislikes: 0,
      },
    ]);
    setCommentText('');
    setCommentImage(null);
  };

  const handleReply = (parentId, replyText, replyImage) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: comment.replies.length + 1,
              text: replyText,
              image: replyImage,
              user: { name: currentUser },
              likes: 0,
              dislikes: 0,
            },
          ],
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  const filteredComments = comments.filter(comment =>
    comment.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <h2 className="chat-heading">
        <Link to="/system">Back to Main Page</Link>
      </h2>
      <h2 className="chat-heading">Channel: {channelName}</h2>
      <div className="reaction-buttons">
        {/* ... (unchanged) */}
      </div>
      <input
        type="text"
        placeholder="Search for Post"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div>
        {filteredComments.map((comment) => (
          <Comment key={comment.id} comment={comment} onReply={handleReply} />
        ))}
      </div>
      <div>
        <input
          className="reply-input"
          type="text"
          placeholder="Add a Post"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <input
          className="image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setCommentImage(e.target.files[0])}
        />
        <button className="reply-button" onClick={handleAddComment}>
          Add Post
        </button>
      </div>
    </div>
  );
};

export default Chat;
