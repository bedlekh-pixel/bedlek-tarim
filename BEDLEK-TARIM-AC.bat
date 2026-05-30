@echo off
title BEDLEK TARIM
color 0A
cd /d "%~dp0"

echo  ==========================================
echo   BEDLEK TARIM - Tarla Takip ve Muhasebe
echo  ==========================================
echo.
echo  Sunucu baslatiliyor...

:: Node kontrolu
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [HATA] Node.js bulunamadi!
    echo  BEDLEK-TARIM-KUR-ve-AC.bat dosyasini deneyin.
    pause
    exit
)

:: Sunucuyu arka planda baslat
start /b node "%~dp0node_modules\vite\bin\vite.js" preview --port 5174

echo  Lutfen bekleyin (3 saniye)...
timeout /t 3 /nobreak >nul

:: Tarayiciyi ac
start "" "http://localhost:5174"

echo.
echo  Uygulama calisiyor! Bu pencereyi KAPATMAYIN.
echo  Kapamak icin ENTER'a basin.
echo.
pause >nul
