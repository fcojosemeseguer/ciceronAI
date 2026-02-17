# Sistema de Formatos de Debate - Implementación Completa

## Resumen

Se ha implementado un sistema completo que permite seleccionar entre dos formatos de debate: **UPCT** y **RETOR**.

## Backend (Python/FastAPI)

### Nuevos Endpoints API v2

1. **GET `/api/v2/formats`**
   - Lista los formatos disponibles (UPCT y RETOR)
   - Retorna: código, nombre, descripción y número de fases

2. **POST `/api/v2/projects`**
   - Crea un proyecto con formato seleccionable
   - Parámetros: jwt, name, description, format_type (UPCT|RETOR)
   - Default: UPCT si no se especifica

3. **GET `/api/v2/projects/{code}/interepretation`**
   - Evalúa según el formato del proyecto automáticamente
   - Detecta el formato y aplica criterios correspondientes

### Configuración de Formatos

**UPCT (I Torneo de Debate UPCT):**
- 5 fases: Introducción, Refutación 1, Refutación 2, Conclusión, Final
- 10 criterios por fase
- Evaluación final del equipo con mejor orador

**RETOR (Formato Académico RETOR):**
- 4 fases: Contextualización (6min), Definición (2min), Valoración (5min), Conclusión (3min)
- 5 ítems de evaluación:
  1. Comprensión de la Moción y Desarrollo del Debate
  2. Relevancia de la Información Presentada
  3. Argumentación y Refutación
  4. Oratoria y Capacidad Persuasiva
  5. Trabajo en Equipo y Uso del Formato RETOR
- Reglas especiales: Minuto protegido, minuto de oro, alternancia de intervenciones

## Frontend (React/TypeScript)

### Componente SetupScreen.tsx

Se ha agregado un **selector de formato** en la pantalla de configuración:

- Carga automáticamente los formatos disponibles del backend
- Dropdown con estilo consistente con la app (Aurora)
- Muestra descripción del formato seleccionado
- Valor por defecto: UPCT
- Envía el formato seleccionado al crear el proyecto

### Store projectStore.ts

Nuevas funciones y estado:
- `loadFormats()`: Carga formatos disponibles
- `availableFormats`: Lista de formatos
- `formatsLoading`: Estado de carga
- `createProject()` ahora acepta `formatType`

### Tipos

```typescript
interface DebateConfig {
  teamAName: string;
  teamBName: string;
  debateTopic: string;
  formatType?: string;  // Nuevo campo
  roundDurations: {...};
}
```

## Uso

### Crear proyecto con formato específico:

```typescript
const { createProject, loadFormats, availableFormats } = useProjectStore();

// Cargar formatos al inicio
useEffect(() => {
  loadFormats();
}, []);

// Crear proyecto
await createProject(
  'Tema del debate',
  'Descripción',
  {
    teamAName: 'Equipo A',
    teamBName: 'Equipo B',
    debateTopic: 'Tema',
    formatType: 'RETOR'  // o 'UPCT'
  }
);
```

### Interfaz de Usuario

El selector aparece en la pantalla de configuración con:
- Icono de libro (BookOpen)
- Label "FORMATO DE DEBATE"
- Dropdown con opciones cargadas dinámicamente
- Descripción del formato seleccionado
- Estilo consistente con el diseño Aurora (púrpura)

## Compatibilidad

- ✅ API v1 sigue funcionando para autenticación
- ✅ Proyectos existentes usan UPCT por defecto
- ✅ Frontend hace build sin errores
- ✅ Backend detecta formato automáticamente

## Archivos Modificados/Creados

### Backend:
- `backend/main.py` - Agregado router v2
- `backend/app/core/database.py` - Campo format_type
- `backend/app/core/debate_formats.py` - Configuración de formatos (NUEVO)
- `backend/app/processors/pipeline.py` - Soporte multi-formato
- `backend/app/api/v2/projects.py` - Endpoints v2 (NUEVO)
- `backend/app/api/v2/models.py` - Modelos para formatos
- `backend/data/prompts/prompts.py` - Prompts RETOR
- `backend/docs/FORMATOS_DEBATE.md` - Documentación

### Frontend:
- `frontend/src/services/apiV2.ts` - Servicio API v2 (NUEVO)
- `frontend/src/services/projectService.ts` - Métodos getFormats y createProject
- `frontend/src/services/index.ts` - Exportaciones
- `frontend/src/store/projectStore.ts` - loadFormats, availableFormats
- `frontend/src/types/index.ts` - formatType en DebateConfig
- `frontend/src/components/screens/SetupScreen.tsx` - Selector de formato

## Estado

✅ **Listo para usar**
- Backend corriendo en http://localhost:5000
- Frontend corriendo en http://localhost:3000
- Selector de formato visible en configuración de debate
- Proyectos se crean con formato seleccionado
- Evaluación usa el formato correcto automáticamente
