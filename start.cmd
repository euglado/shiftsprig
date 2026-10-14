@echo off
cd /d "%~dp0"
call npm.cmd start
set "result=%errorlevel%"
pause
exit /b %result%
