import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer.jsx';

const VideoPage = () => {
  const { id } = useParams();

  return (
    <div>
      <VideoPlayer videoId={id} />
    </div>
  );
};

export default VideoPage;
