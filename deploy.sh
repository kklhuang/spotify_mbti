# Install dependencies for the frontend
cd client && npm i

# Install dependencies for the backend
cd ../auth && npm i

# Start the backend
node app.js &

# Start the frontend
cd ../client && npm start
