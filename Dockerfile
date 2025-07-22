# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    procps \
    && rm -rf /var/cache/apk/*

# Copy application code first
COPY . .

# Install dependencies
RUN npm install
RUN cd client && npm install || echo "Client directory not found, skipping client install"
RUN cd server && npm install || echo "Server directory not found, skipping server install"

# Create log directory
RUN mkdir -p /app/logs

# Expose ports
EXPOSE 3001 5000

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting AnimeStream Platform..."

# Kill any existing processes
pkill -f "ts-node\|vite" 2>/dev/null || true
sleep 2

# Start backend server
echo "📺 Starting backend server..."
npx ts-node server/index.ts > /app/logs/backend.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 6

# Start frontend
echo "🎨 Starting frontend..."
cd client
npx vite --host 0.0.0.0 --port 5000 > /app/logs/frontend.log 2>&1 &
CLIENT_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo "🎯 Servers started!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5000"

# Test backend API
echo "🔍 Testing AnimeKai API integration..."
sleep 3
timeout 20 curl -s "http://localhost:3001/api/search?query=naruto" | head -200 || echo "Testing complete"

echo ""
echo "📊 Check logs: /app/logs/backend.log, /app/logs/frontend.log"
echo "Press Ctrl+C to stop all servers"

# Function to handle shutdown
cleanup() {
    echo "Stopping servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}

# Set trap for graceful shutdown
trap cleanup SIGTERM SIGINT

# Keep container running
while true; do
    sleep 60
    # Check if processes are still running
    if ! kill -0 $SERVER_PID 2>/dev/null || ! kill -0 $CLIENT_PID 2>/dev/null; then
        echo "One or more processes stopped unexpectedly"
        cleanup
    fi
done
EOF

# Make startup script executable
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/health || curl -f http://localhost:5000 || exit 1

# Start the application
CMD ["/app/start.sh"]
