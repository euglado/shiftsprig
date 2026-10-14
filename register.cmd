@echo off
cd /d "%~dp0"
call npm.cmd run register
set "result=%errorlevel%"
pause
exit /b %result%
