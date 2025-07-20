import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'video') {
      setVideoFile(files[0]);
    } else if (name === 'thumbnail') {
      setThumbnailFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!videoFile) {
      setError('Please select a video file');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('video', videoFile);
    if (thumbnailFile) {
      formDataToSend.append('thumbnail', thumbnailFile);
    }

    try {
      const response = await fetch('/api/video/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Upload Video</h2>
      
      {error && (
        <div style={{ color: '#ff0000', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail (Optional)</label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
