@echo off
echo ========================================
echo   PUSH TO GITHUB - Little Hearts
echo ========================================
echo.
echo This will push your code to:
echo https://github.com/churanikanth/Little-Hearts
echo.
echo You will need to authenticate with GitHub.
echo.
pause

echo.
echo Pushing to GitHub...
git push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo View your repository at:
    echo https://github.com/churanikanth/Little-Hearts
) else (
    echo ========================================
    echo   AUTHENTICATION REQUIRED
    echo ========================================
    echo.
    echo Please authenticate using one of these methods:
    echo.
    echo 1. GitHub Desktop (Easiest)
    echo    - Download from: https://desktop.github.com/
    echo    - Sign in and publish repository
    echo.
    echo 2. Personal Access Token
    echo    - Go to: GitHub Settings ^> Developer settings ^> Tokens
    echo    - Generate new token with 'repo' scope
    echo    - Use token as password when prompted
    echo.
    echo 3. See PUSH_TO_GITHUB.md for detailed instructions
)

echo.
pause
