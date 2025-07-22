#!/bin/bash

echo "🚀 Starting AnimeStream Platform..."

# Kill any existing processes
pkill -f "ts-node\|vite" 2>/dev/null || true
sleep 2

# Start backend server
echo "📺 Starting backend server..."
npx ts-node server/index.ts > backend.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 6

# Start frontend
echo "🎨 Starting frontend..."
cd client
npx vite --host 0.0.0.0 --port 5000 > ../frontend.log 2>&1 &
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
echo "📊 Check logs: backend.log, frontend.log"
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT

# Keep running
while true; do
    sleep 60
done