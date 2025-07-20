import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem',
      minHeight: '200px'
    }}>
      <div className="spinner" style={{ marginBottom: '1rem' }}></div>
      <p>{message}</p>
    </div>
  );
};

Loading.propTypes = {
  message: PropTypes.string
};

export default Loading;
