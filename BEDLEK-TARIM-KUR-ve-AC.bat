@echo off
title BEDLEK TARIM
color 0A
cd /d "%~dp0"

echo  ==========================================
echo   BEDLEK TARIM - Tarla Takip ve Muhasebe
echo  ==========================================
echo.
echo  Baslatiliyor, lutfen bekleyin...
echo.

:: Portable node'u bul
set NODE=
if exist "%~dp0..\nodejs\node-v24.15.0-win-x64\node.exe" (
    set NODE="%~dp0..\nodejs\node-v24.15.0-win-x64\node.exe"
    goto BASLAT
)
if exist "C:\Users\Acer\Desktop\nodejs\node-v24.15.0-win-x64\node.exe" (
    set NODE="C:\Users\Acer\Desktop\nodejs\node-v24.15.0-win-x64\node.exe"
    goto BASLAT
)

:: Sistem Node dene
node --version >nul 2>&1
if not errorlevel 1 (
    set NODE=node
    goto BASLAT
)

color 0C
echo  [HATA] Node.js bulunamadi!
pause
exit

:BASLAT
start /b %NODE% "%~dp0node_modules\vite\bin\vite.js" preview --port 4173

echo  Aciliyor (6 saniye)...
timeout /t 6 /nobreak >nul

start http://localhost:4173

echo.
echo  Uygulama calisiyor! Bu pencereyi KAPATMAYIN.
echo.
pause
