import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  if (!video) {
    return null;
  }

  return (
    <div className="video-card">
      <Link to={`/video/${video._id}`}>
        <video 
          className="video-thumbnail"
          src={video.videoFile}
          poster={video.thumbnail}
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => e.target.pause()}
          muted
        />
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <div className="video-meta">
            <p>{video.owner?.username || 'Unknown'}</p>
            <p>{video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

VideoCard.propTypes = {
  video: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    videoFile: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    views: PropTypes.number,
    createdAt: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string
    })
  }).isRequired
};

export default VideoCard;
