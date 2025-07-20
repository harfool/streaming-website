import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        dispatch({ type: 'USER_LOADED', payload: userData.data });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  useEffect(() => {
    if (state.token) {
      // Load user data when token exists
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            token: data.data.accessToken
          }
        });
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAIL' });
        return { success: false, message: data.message };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
