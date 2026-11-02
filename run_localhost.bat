@echo off
title EcoHaven Furniture — Localhost Server
echo ========================================================
echo   EcoHaven Furniture — Candaba Workshop Local Server
echo ========================================================
echo.
echo Starting local web server on http://127.0.0.1:8080...
echo Opening in default browser...
echo.
start http://127.0.0.1:8080/
python -m http.server 8080 --bind 127.0.0.1
pause
