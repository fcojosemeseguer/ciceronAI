# Sistema de Formatos de Debate

Este sistema permite utilizar diferentes formatos de debate: UPCT (existente) y RETOR (nuevo).

## Formatos Disponibles

### 1. UPCT - I Torneo de Debate UPCT
- **5 fases**: Introducción, Refutación 1, Refutación 2, Conclusión, Final
- **10 criterios** por fase de orador
- Evaluación final del equipo con mejor orador

### 2. RETOR - Formato Académico RETOR
- **4 fases**: Contextualización (6min), Definición (2min), Valoración (5min), Conclusión (3min)
- **5 ítems** de evaluación:
  1. Comprensión de la Moción y Desarrollo del Debate
  2. Relevancia de la Información Presentada
  3. Argumentación y Refutación
  4. Oratoria y Capacidad Persuasiva
  5. Trabajo en Equipo y Uso del Formato RETOR
- Reglas especiales: Minuto protegido, Minuto de oro, Alternancia de intervenciones

## Uso

### Crear un proyecto con formato RETOR:

```bash
POST /api/v2/projects
Content-Type: application/json

{
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "name": "Debate Educación",
  "description": "Debate sobre el sistema educativo",
  "format_type": "RETOR"
}
```

### Crear un proyecto con formato UPCT (default):

```bash
POST /api/v2/projects
Content-Type: application/json

{
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "name": "Debate Tecnología",
  "description": "Debate sobre IA",
  "format_type": "UPCT"  // O omitir, usa UPCT por defecto
}
```

### Obtener formatos disponibles:

```bash
GET /api/v2/formats

Response:
[
  {
    "codigo": "UPCT",
    "nombre": "I Torneo de Debate UPCT",
    "descripcion": "Formato de debate académico con 5 fases",
    "num_fases": 5
  },
  {
    "codigo": "RETOR",
    "nombre": "Formato RETOR",
    "descripcion": "Formato de debate académico con 4 fases y 5 ítems de evaluación",
    "num_fases": 4
  }
]
```

### Subir audio y evaluar:

El sistema detecta automáticamente el formato del proyecto y aplica:
- Los criterios de evaluación correctos
- El prompt del sistema apropiado
- Las fases válidas para ese formato

```bash
# Para proyecto RETOR
POST /api/v2/projects/{project_code}/audio
Form-Data:
  - file: [archivo.wav]
  - enc_jwt: [token]
  - fase: "Contextualización"  // Fases válidas: Contextualización, Definición, Valoración, Conclusión
  - equipo: "A Favor"
  - orador: "Orador 1"
  - num_speakers: 2

# Para proyecto UPCT
POST /api/v2/projects/{project_code}/audio
Form-Data:
  - file: [archivo.wav]
  - enc_jwt: [token]
  - fase: "Introducción"  // Fases válidas: Introducción, Refutación 1, Refutación 2, Conclusión, Final
  - equipo: "A Favor"
  - orador: "Orador 1"
  - num_speakers: 2
```

## Fases por Formato

### UPCT:
1. **Introducción** - Presentación del equipo y primera argumentación
2. **Refutación 1** - Primera ronda de refutación
3. **Refutación 2** - Segunda ronda de refutación y puntos de choque
4. **Conclusión** - Resumen y cierre
5. **Final** - Evaluación del equipo completo

### RETOR:
1. **Contextualización** (6 min) - Discusión de hechos y contexto
   - Puede dividirse entre oradores
   - Primer minuto protegido
   - Permite minuto de oro

2. **Definición** (2 min) - Definición de conceptos relevantes
   - Puede dividirse entre oradores
   - Primer minuto protegido
   - Permite minuto de oro

3. **Valoración** (5 min) - Comparación de argumentos y refutación
   - Puede dividirse entre oradores
   - Permite preguntas
   - Permite minuto de oro

4. **Conclusión** (3 min) - Cierre y resumen
   - **NO** se puede dividir (un solo orador)
   - **NO** permite preguntas
   - **NO** permite minuto de oro
   - **NO** se puede introducir información nueva

## Estructura de Archivos

```
backend/
├── app/
│   ├── api/
│   │   └── v2/
│   │       ├── projects.py      # Endpoints actualizados
│   │       └── models.py        # Modelos con format_type
│   ├── core/
│   │   ├── database.py          # Campo format_type en projects
│   │   └── debate_formats.py    # Configuración de formatos
│   └── processors/
│       └── pipeline.py          # Soporte multi-formato
├── data/
│   └── prompts/
│       └── prompts.py           # Prompts UPCT y RETOR
```

## Características del Sistema

✅ **Automático**: El sistema detecta el formato del proyecto automáticamente  
✅ **Backward Compatible**: Proyectos existentes usan UPCT por defecto  
✅ **Extensible**: Fácil agregar nuevos formatos en el futuro  
✅ **Validación**: Valida que las fases correspondan al formato del proyecto  
✅ **Prompts Específicos**: Cada formato tiene su propio prompt de sistema  

## Ejemplo de Evaluación RETOR

```json
{
  "message": "analysis succeeded!",
  "fase": "Contextualización",
  "postura": "A Favor",
  "orador": "Orador 1",
  "criterios": [
    {"criterio": "comprension_mocion_desarrollo", "nota": 3, "anotacion": "Buena estructura"},
    {"criterio": "relevancia_informacion", "nota": 4, "anotacion": "Excelentes fuentes"},
    {"criterio": "argumentacion_refutacion", "nota": 3, "anotacion": "Sólida argumentación"},
    {"criterio": "oratoria_persuasion", "nota": 3, "anotacion": "Buena proyección"},
    {"criterio": "trabajo_equipo_formato", "nota": 4, "anotacion": "Excelente coordinación"}
  ],
  "total": 17,
  "max_total": 20,
  "format_type": "RETOR"
}
```
