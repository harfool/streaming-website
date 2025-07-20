# Streaming Website

This project is a full-stack streaming website built with Node.js. It provides features such as user authentication, video uploads, playlists, comments, likes, subscriptions, and more. The backend is organized using the MVC (Model-View-Controller) pattern for scalability and maintainability.

## Features

- User registration and authentication
- Video upload and streaming
- Playlist management
- Like and comment system
- User subscriptions
- Dashboard for user activity

## Project Structure

```
src/                    # Backend source code
  app.js                # Main Express app setup
  constants.js          # Application constants
  index.js              # Entry point
  controllers/          # Route controllers for business logic
  db/                   # Database connection and setup
  middlewares/          # Express middlewares (auth, multer, etc.)
  models/               # Mongoose models for MongoDB
  routes/               # API route definitions
  utils/                # Utility classes and helpers
client/                 # Frontend React application
  public/               # Static files
  src/
    components/         # Reusable React components
    context/            # React context for state management
    pages/              # React page components
    App.js              # Main React app component
    index.js            # React app entry point
    index.css           # Global styles
  package.json          # Frontend dependencies
public/
  temp/                 # Temporary files (e.g., uploads)
package.json            # Backend dependencies and scripts
Readme.md               # Project documentation
```

## Features Implemented

### Backend Features
- User authentication (JWT)
- Video upload and storage (Cloudinary)
- CRUD operations for videos, comments, likes
- Playlist management
- Subscription system
- Dashboard analytics

### Frontend Features
- Responsive React application
- User authentication (login/register)
- Video upload interface
- Video player with controls
- Comment system
- Like/Unlike functionality
- Subscribe/Unsubscribe
- User dashboard
- Playlist management
- Protected routes

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB instance (local or cloud)

### Installation

#### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/harfool/streaming-website.git
   cd streaming-website
   ```
2. Install backend dependencies:
   ```
   npm install
   ```
3. Set up environment variables (create a `.env` file):
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the backend server:
   ```
   npm run dev
   ```

#### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Start the React development server:
   ```
   npm start
   ```

The backend will run on `http://localhost:8000` and the frontend on `http://localhost:3000`.

## Usage

### Backend API
- Access the API endpoints as defined in the `src/routes/` directory.
- Use tools like Postman or the React frontend to interact with the API.
- API runs on `http://localhost:8000`

### Frontend Application
- Open `http://localhost:3000` in your browser
- Register a new account or login with existing credentials
- Upload videos, create playlists, and interact with content
- View your dashboard for analytics and video management

### Key Frontend Pages
- **Home (`/`)**: Browse all videos
- **Login (`/login`)**: User authentication
- **Register (`/register`)**: Create new account
- **Upload (`/upload`)**: Upload new videos (protected)
- **Dashboard (`/dashboard`)**: Manage your content (protected)
- **Playlists (`/playlists`)**: Create and manage playlists (protected)
- **Video Player (`/video/:id`)**: Watch videos with comments and interactions

## Folder Details

- **src/controllers/**: Handles the main logic for each route (e.g., user, video, comment controllers).
- **src/models/**: Mongoose schemas for MongoDB collections.
- **src/routes/**: Express route definitions for each resource.
- **src/middlewares/**: Custom middleware for authentication, file uploads, etc.
- **src/utils/**: Helper classes for API responses, error handling, and third-party integrations (e.g., Cloudinary).
- **client/src/components/**: Reusable React components (Header, VideoCard, VideoPlayer, etc.).
- **client/src/pages/**: Main page components (Home, Login, Dashboard, etc.).
- **client/src/context/**: React Context for global state management (Authentication).
- **client/src/services/**: API service functions for making HTTP requests.

## Quick Start

For a quick start on Windows, you can use the provided batch file:
```
start.bat
```

Or manually start both servers:

1. **Backend**: `npm run dev` (from root directory)
2. **Frontend**: `npm start` (from client directory)

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (file storage)
- Multer (file uploads)
- bcrypt (password hashing)

### Frontend
- React 18
- React Router DOM
- Axios (HTTP client)
- Context API (state management)
- CSS3 (responsive design)

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
