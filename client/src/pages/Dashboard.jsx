import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    videos: [],
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          videos: data.data?.videos || [],
          totalVideos: data.data?.totalVideos || 0,
          totalViews: data.data?.totalViews || 0,
          totalSubscribers: data.data?.totalSubscribers || 0
        });
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/video/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-section">
        <h3>Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#303030', borderRadius: '4px', textAlign: 'center' }}>
            <h4>{dashboardData.totalVideos}</h4>
            <p>Total Videos</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#303030', borderRadius: '4px', textAlign: 'center' }}>
            <h4>{dashboardData.totalViews}</h4>
            <p>Total Views</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#303030', borderRadius: '4px', textAlign: 'center' }}>
            <h4>{dashboardData.totalSubscribers}</h4>
            <p>Subscribers</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Your Videos</h3>
          <Link to="/upload" className="btn btn-primary">
            Upload New Video
          </Link>
        </div>
        
        {dashboardData.videos.length === 0 ? (
          <p>You haven't uploaded any videos yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {dashboardData.videos.map((video) => (
              <div key={video._id} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                backgroundColor: '#303030', 
                borderRadius: '4px' 
              }}>
                <video 
                  style={{ width: '200px', height: '120px', objectFit: 'cover' }}
                  src={video.videoFile}
                  poster={video.thumbnail}
                />
                <div style={{ flex: 1 }}>
                  <h4>{video.title}</h4>
                  <p style={{ color: '#aaa', marginTop: '0.5rem' }}>
                    {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>{video.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to={`/video/${video._id}`} className="btn btn-secondary">
                    View
                  </Link>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => deleteVideo(video._id)}
                    style={{ backgroundColor: '#ff0000' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
