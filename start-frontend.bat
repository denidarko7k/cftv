@echo off
setlocal

cd /d "%~dp0"
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=%NODE_PATH%;%PATH%"
start "Ocorrencias - Servidor" /D "%~dp0" cmd.exe /k ""%NODE_PATH%\npm.cmd" run start:dev"
timeout /t 12 /nobreak >nul
start "" "http://localhost:3000"

endlocal