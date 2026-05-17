@echo off
cd /d "%~dp0"
start "" "http://localhost:5174"
npx vite preview --port 5174
