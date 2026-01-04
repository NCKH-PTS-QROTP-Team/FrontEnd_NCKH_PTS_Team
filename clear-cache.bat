@echo off
echo Clearing Expo and Metro cache...
rd /s /q .expo 2>nul
rd /s /q node_modules\.cache 2>nul
echo Cache cleared!
echo.
echo Now run: npm run web
pause
