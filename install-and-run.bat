@echo off
echo ========================================
echo   ServiceOps Pro - Instalacion y Ejecucion
echo ========================================
echo.

echo 📦 Instalando dependencias del proyecto raiz...
call npm install

echo.
echo 📦 Instalando dependencias del backend...
cd backend
call npm install

echo.
echo 📦 Instalando dependencias del frontend...
cd ..\frontend
call npm install

echo.
echo 🌱 Ejecutando seed de datos (opcional)...
cd ..\backend
call npm run seed

echo.
echo 🚀 Iniciando aplicacion completa...
cd ..
call npm run dev

pause