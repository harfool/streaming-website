import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

const VideoPlayer = ({ videoId }) => {
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/video/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setVideo(data.data);
      } else {
        console.error('Failed to fetch video');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comment/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated || !video) return;
    
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: video.owner._id })
      });
      
      if (response.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;

    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId, text: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading || !video) {
    return <Loading message="Loading video..." />;
  }

  return (
    <div className="video-player-container">
      <video 
        className="video-player"
        src={video.videoFile}
        controls
        poster={video.thumbnail}
      />
      
      <div className="video-details">
        <h1>{video.title}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            <p><strong>{video.owner?.username || 'Unknown User'}</strong></p>
            <p>{video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}</p>
          </div>
          
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleLike}
              >
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              <button 
                className={`btn ${isSubscribed ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </div>
          )}
        </div>
        
        <p style={{ marginTop: '1rem' }}>{video.description}</p>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        {isAuthenticated && (
          <form onSubmit={handleAddComment} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Comment
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem' }}>
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-author">{comment.owner?.username || 'Anonymous'}</div>
              <div>{comment.content || comment.text}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired
};

export default VideoPlayer;
