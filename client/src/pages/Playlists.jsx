import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.data || []);
      } else {
        console.error('Failed to fetch playlists');
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlaylist)
      });

      if (response.ok) {
        fetchPlaylists();
        setNewPlaylist({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/playlist/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Playlists</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create Playlist
        </button>
      </div>

      {showCreateForm && (
        <div className="form-container" style={{ marginBottom: '2rem' }}>
          <h3>Create New Playlist</h3>
          <form onSubmit={handleCreatePlaylist}>
            <div className="form-group">
              <label htmlFor="name">Playlist Name</label>
              <input
                type="text"
                id="name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                rows="3"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="video-grid">
        {playlists.map((playlist) => (
          <div key={playlist._id} className="video-card">
            <div className="video-info">
              <h3 className="video-title">{playlist.name}</h3>
              <p className="video-meta">{playlist.description}</p>
              <p className="video-meta">{playlist.videos?.length || 0} videos</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => deletePlaylist(playlist._id)}
                  style={{ backgroundColor: '#ff0000' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>You don't have any playlists yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Playlist
          </button>
        </div>
      )}
    </div>
  );
};

export default Playlists;
