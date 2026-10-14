@echo off
cd /d "%~dp0"
call npm.cmd ci --ignore-scripts
if errorlevel 1 exit /b 1
call npm.cmd run build
if errorlevel 1 exit /b 1
call npm.cmd run setup
set "result=%errorlevel%"
pause
exit /b %result%
