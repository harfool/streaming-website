@echo off
echo ================================
echo  Streaming Website Setup Script
echo ================================
echo.

echo [1/4] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Creating environment files...
cd..
if not exist .env (
    echo Creating .env file for backend...
    (
        echo PORT=8000
        echo MONGODB_URI=mongodb://localhost:27017/streaming-website
        echo JWT_SECRET=your-super-secret-jwt-key-here
        echo CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
        echo CLOUDINARY_API_KEY=your-cloudinary-api-key
        echo CLOUDINARY_API_SECRET=your-cloudinary-api-secret
        echo CORS_ORIGIN=http://localhost:3000
    ) > .env
    echo .env file created! Please update with your actual values.
)

cd client
if not exist .env (
    echo Creating .env file for frontend...
    (
        echo REACT_APP_API_URL=http://localhost:8000/api
        echo REACT_APP_APP_NAME=StreamTube
        echo GENERATE_SOURCEMAP=false
    ) > .env
    echo client/.env file created!
)

cd..
echo.
echo [4/4] Setup completed successfully!
echo.
echo ================================
echo  Next Steps:
echo ================================
echo 1. Update the .env file with your MongoDB URI and Cloudinary credentials
echo 2. Make sure MongoDB is running
echo 3. Run 'start.bat' to start both servers
echo 4. All JavaScript files have been converted to JSX
echo 5. PropTypes validation has been added for better error handling
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
pause
