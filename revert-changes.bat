@echo off
echo This will reset all changes to match the last commit.
echo WARNING: This will discard all uncommitted changes!
echo.
choice /c YN /m "Are you sure you want to continue? [Y/N]"
if %ERRORLEVEL% equ 2 (
    echo Operation cancelled by user.
    exit /b 1
)

echo.
echo Resetting all changes to last commit...

:: Reset all tracked files
git reset --hard HEAD

:: Remove all untracked files and directories
git clean -fd

echo.
echo All changes have been reverted to the last commit.
pause
