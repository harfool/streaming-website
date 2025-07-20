import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard.jsx';
import Loading from '../components/Loading.jsx';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/video/all');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.data || []);
      } else {
        console.error('Failed to fetch videos');
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading videos..." />;
  }

  return (
    <div>
      <h1 style={{ padding: '2rem', textAlign: 'center' }}>Latest Videos</h1>
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
      {videos.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          No videos available
        </div>
      )}
    </div>
  );
};

export default Home;
