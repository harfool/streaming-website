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
src/
  app.js                # Main Express app setup
  constants.js          # Application constants
  index.js              # Entry point
  controllers/          # Route controllers for business logic
  db/                   # Database connection and setup
  middlewares/          # Express middlewares (auth, multer, etc.)
  models/               # Mongoose models for MongoDB
  routes/               # API route definitions
  utils/                # Utility classes and helpers
public/
  temp/                 # Temporary files (e.g., uploads)
package.json            # Project dependencies and scripts
Readme.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/harfool/streaming-website.git
   cd streaming-website
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (create a `.env` file as needed):
   - Example variables: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_API_KEY`, etc.
4. Start the development server:
   ```
   npm start
   ```

## Usage

- Access the API endpoints as defined in the `src/routes/` directory.
- Use tools like Postman or a frontend client to interact with the API.

## Folder Details

- **controllers/**: Handles the main logic for each route (e.g., user, video, comment controllers).
- **models/**: Mongoose schemas for MongoDB collections.
- **routes/**: Express route definitions for each resource.
- **middlewares/**: Custom middleware for authentication, file uploads, etc.
- **utils/**: Helper classes for API responses, error handling, and third-party integrations (e.g., Cloudinary).

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
