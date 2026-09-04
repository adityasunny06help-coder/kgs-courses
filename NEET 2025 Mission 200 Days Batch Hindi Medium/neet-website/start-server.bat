@echo off
echo Starting local web server...
echo Please wait, your browser will open shortly.
start http://localhost:8000
python -m http.server 8000
pause
