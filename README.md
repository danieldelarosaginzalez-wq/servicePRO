# ServiceOps Pro - Sistema Completo

Sistema integral de gestión de órdenes de trabajo, inventario de materiales y técnicos con interfaz React + Grid Excel.

## 🚀 Estado del Sistema

✅ **Backend**: NestJS + MongoDB - Funcionando en http://localhost:3001  
✅ **Frontend**: React + AG-Grid - Iniciándose en http://localhost:3000  
✅ **Base de Datos**: MongoDB con datos de prueba cargados  

## 📋 Funcionalidades Implementadas

### **Backend (NestJS + MongoDB)**
- ✅ Sistema de autenticación JWT completo
- ✅ Módulos para Usuarios, Pólizas, Órdenes, Materiales
- ✅ Esquemas MongoDB con validaciones
- ✅ API REST con endpoints funcionales
- ✅ Seed de datos de prueba

### **Frontend (React + AG-Grid)**
- ✅ Interfaz completa con Material-UI
- ✅ Componente ExcelGrid reutilizable
- ✅ Páginas: Login, Dashboard, Órdenes, Materiales, Pólizas, Inventario, Reportes
- ✅ Contexto de autenticación
- ✅ Servicios API centralizados

### **Características del Grid Excel**
- 📊 Edición inline de celdas
- 📤 Exportación a Excel/CSV
- 🔍 Filtros avanzados por columna
- 🔄 Actualización en tiempo real
- 📱 Responsive y optimizado

## 👥 Usuarios de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Analista** | analista@test.com | 123456 | Crear órdenes, asignar técnicos, revisar trabajos |
| **Técnico** | tecnico@test.com | 123456 | Ver órdenes asignadas, reportar materiales, subir evidencias |
| **Inventario** | inventario@test.com | 123456 | Gestionar inventarios, asignar materiales, resolver descuadres |

## 🛠️ Instalación y Ejecución

### Opción 1: Script Automático (Recomendado)

**Windows:**
```bash
.\install-and-run.bat
```

**Linux/Mac:**
```bash
chmod +x install-and-run.sh
./install-and-run.sh
```

### Opción 2: Manual

1. **Instalar dependencias:**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Configurar base de datos:**
```bash
# Asegúrate de tener MongoDB ejecutándose en localhost:27017
cd backend
npm run seed  # Carga datos de prueba
```

3. **Ejecutar aplicación:**
```bash
# Desde la raíz del proyecto
npm run dev
```

O ejecutar por separado:
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Documentación API**: http://localhost:3001/api (próximamente)

## 📁 Estructura del Proyecto

```
serviceops-pro/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/     # Autenticación JWT
│   │   ├── users/    # Gestión de usuarios
│   │   ├── orders/   # Órdenes de trabajo
│   │   ├── polizas/  # Pólizas de servicio
│   │   ├── materials/# Catálogo de materiales
│   │   └── database/ # Seeds y configuración
├── frontend/         # React App con AG-Grid
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas principales
│   │   ├── services/    # Servicios API
│   │   └── contexts/    # Contextos React
├── shared/           # Tipos TypeScript compartidos
└── docs/            # Documentación
```

## 🔧 Tecnologías Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Passport** - Estrategias de autenticación
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes de interfaz
- **AG-Grid** - Grid Excel avanzado
- **React Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **React Router** - Navegación

## 📊 Funcionalidades por Rol

### Analista
- ✅ Crear y gestionar pólizas
- ✅ Crear órdenes de trabajo
- ✅ Asignar técnicos a órdenes
- ✅ Revisar trabajos completados
- ✅ Ver reportes y métricas
- ✅ Dashboard con estadísticas

### Técnico
- ✅ Ver órdenes asignadas
- ✅ Iniciar/finalizar trabajos
- ✅ Reportar consumo de materiales
- ✅ Subir evidencias fotográficas
- ✅ Consultar inventario personal
- ✅ Reportar imposibilidades

### Analista de Inventario
- ✅ Gestionar catálogo de materiales
- ✅ Asignar materiales a técnicos
- ✅ Controlar inventarios individuales
- ✅ Resolver descuadres de materiales
- ✅ Ver movimientos de inventario

## 🎯 Próximas Funcionalidades

- [x] Sistema de archivos para evidencias
- [x] WebSockets para actualizaciones en tiempo real
- [x] Módulo de comprobantes de visita con firmas
- [x] Control de materiales con descuadres
- [ ] Geolocalización de técnicos
- [ ] Notificaciones push
- [ ] Reportes PDF automáticos
- [ ] Modo offline

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version
# O usar MongoDB Atlas (cloud)
```

### Errores de dependencias
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Puerto ocupado
```bash
# Cambiar puerto en backend/.env
PORT=3002
```

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades, crear un issue en el repositorio del proyecto.

---

**ServiceOps Pro** - Sistema de gestión empresarial con interfaz Excel integrada 🚀