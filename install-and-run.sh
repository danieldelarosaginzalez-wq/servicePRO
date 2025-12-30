#!/bin/bash

echo "========================================"
echo "  ServiceOps Pro - Instalación y Ejecución"
echo "========================================"
echo

echo "📦 Instalando dependencias del proyecto raíz..."
npm install

echo
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

echo
echo "🌱 Ejecutando seed de datos (opcional)..."
cd ../backend
npm run seed

echo
echo "🚀 Iniciando aplicación completa..."
cd ..
npm run dev