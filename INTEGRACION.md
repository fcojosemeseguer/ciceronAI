# CiceronAI - Integración Frontend/Backend

## Resumen de Cambios

Se ha completado la integración completa entre el frontend React y el backend FastAPI.

### Archivos Creados/Modificados

#### Nuevos Servicios (`frontend/src/services/`)
- `api.ts` - Cliente HTTP base con fetch
- `authService.ts` - Servicio de autenticación
- `projectService.ts` - Gestión de proyectos
- `analysisService.ts` - Análisis de audio con IA
- `index.ts` - Exportaciones centralizadas

#### Stores Actualizados
- `authStore.ts` - Ahora usa backend real (reemplazó mock)
- `projectStore.ts` - Nuevo store para proyectos conectado a API
- `store/index.ts` - Exportaciones centralizadas

#### Componentes Actualizados
- `SetupScreen.tsx` - Crea proyecto en backend al iniciar
- `HomeScreen.tsx` - Carga proyectos desde backend
- `useAutoAudioRecording.ts` - Envía audio al backend para análisis

#### Configuración
- `frontend/.env` - Variables de entorno

### Cómo Ejecutar

#### Opción 1: Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

#### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

### Funcionalidades Integradas

1. **Autenticación**
   - Login con backend real
   - Registro de usuarios
   - JWT tokens persistentes

2. **Proyectos/Debates**
   - Crear proyecto al configurar debate
   - Listar proyectos del usuario
   - Persistencia en backend

3. **Análisis de Audio**
   - Grabación automática por ronda
   - Envío al backend al finalizar
   - Análisis con IA (transcripción + métricas)
   - Evaluación según rúbrica

### Notas Importantes

- El backend debe estar corriendo en el puerto 5000
- CORS ya está configurado en el backend
- Las grabaciones se envían automáticamente al backend
- Los resultados del análisis se muestran en consola (puedes extender para mostrar en UI)

### Próximos Pasos Sugeridos

1. Mostrar resultados del análisis en la UI
2. Implementar vista detallada de proyectos
3. Agregar descarga de reportes PDF desde backend
4. Sincronizar más datos del debate con el backend
