# Install dependencies for the frontend
cd client && npm i

# Build the frontend
npm run build

# Install dependencies for the backend
cd ../authorization_code && npm i

# Start the backend
node app.js &

# Start the frontend
cd ../client && npm start
