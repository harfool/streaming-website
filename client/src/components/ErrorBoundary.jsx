import React from 'react';
import PropTypes from 'prop-types';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setError(error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#ff0000',
        color: 'white',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <h2>Something went wrong!</h2>
        <p>{error?.message || 'An unexpected error occurred'}</p>
        <button 
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'white',
            color: '#ff0000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return children;
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
