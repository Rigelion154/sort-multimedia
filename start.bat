@echo off
echo Checking for Node.js...

REM Проверка наличия Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b
)

echo Node.js is installed. Proceeding with setup...

echo setup modules...
call npm install
if %errorlevel% neq 0 (
    echo Error during npm install. Exiting...
    pause
    exit /b
)

echo setup modules complete.


echo start server...
call node dist/index.js
if %errorlevel% neq 0 (
    echo Failed to start server. Check the code.
    pause
    exit /b
)

echo Server started successfully. Running at http://localhost:8535
pause
