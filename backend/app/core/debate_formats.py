"""
Configuración de formatos de debate predeterminados.

Formatos disponibles:
- UPCT: Formato del I Torneo de Debate UPCT (5 fases)
- RETOR: Formato académico RETOR (4 fases)
"""

from enum import Enum
from typing import Dict, List


class DebateFormat(str, Enum):
    """Formatos de debate disponibles."""
    UPCT = "UPCT"
    RETOR = "RETOR"


class DebateFaseUPCT(str, Enum):
    """Fases del formato UPCT."""
    INTRO = "Introducción"
    REF1 = "Refutación 1"
    REF2 = "Refutación 2"
    CONCLUSION = "Conclusión"
    FINAL = "Final"


class DebateFaseRETOR(str, Enum):
    """Fases del formato RETOR."""
    CONTEXTUALIZACION = "Contextualización"
    DEFINICION = "Definición"
    VALORACION = "Valoración"
    CONCLUSION = "Conclusión"


# Configuración del formato UPCT (existente)
FORMATO_UPCT = {
    "nombre": "I Torneo de Debate UPCT",
    "descripcion": "Formato de debate académico con 5 fases",
    "fases": {
        DebateFaseUPCT.INTRO: {
            "criterios": [
                "introduccion_llamativa",
                "statu_quo_definiciones",
                "linea_argumental",
                "pertinencia_preguntas",
                "verosimilitud_evidencias",
                "razonamiento_argumentacion",
                "comprension_premisa_contraria",
                "comunicacion_eficacia_liderazgo",
                "uso_riqueza_lenguaje",
                "ajuste_tiempo"
            ],
            "tiempo_minutos": None,  # Variable según el debate
            "permite_preguntas": True,
            "descripcion": "Introducción al debate"
        },
        DebateFaseUPCT.REF1: {
            "criterios": [
                "introduccion_llamativa",
                "linea_argumental_solucion",
                "refutacion_defensa",
                "pertinencia_preguntas",
                "verosimilitud_evidencias",
                "razonamiento_argumentacion",
                "comprension_argumentos_oponentes",
                "comunicacion_eficacia_liderazgo",
                "uso_riqueza_lenguaje",
                "ajuste_tiempo"
            ],
            "tiempo_minutos": None,
            "permite_preguntas": True,
            "descripcion": "Primera refutación"
        },
        DebateFaseUPCT.REF2: {
            "criterios": [
                "introduccion_llamativa",
                "refutacion_puntos_choque",
                "reconstruccion_linea_argumental",
                "pertinencia_preguntas",
                "verosimilitud_evidencias",
                "razonamiento_argumentacion",
                "comprension_argumentos_oponentes",
                "comunicacion_eficacia_liderazgo",
                "uso_riqueza_lenguaje",
                "ajuste_tiempo"
            ],
            "tiempo_minutos": None,
            "permite_preguntas": True,
            "descripcion": "Segunda refutación"
        },
        DebateFaseUPCT.CONCLUSION: {
            "criterios": [
                "introduccion_llamativa",
                "resumen_sin_info_nueva",
                "puntos_acogida_choque",
                "reivindicacion_postura",
                "explicacion_exordio",
                "razonamiento_argumentacion",
                "comprension_argumentos_oponentes",
                "comunicacion_eficacia_liderazgo",
                "uso_riqueza_lenguaje",
                "ajuste_tiempo"
            ],
            "tiempo_minutos": None,
            "permite_preguntas": True,
            "descripcion": "Conclusión del debate"
        },
        DebateFaseUPCT.FINAL: {
            "criterios": [
                "sumatorio_oradores",
                "estructuracion_conexion_equipo",
                "mejor_orador"
            ],
            "tiempo_minutos": None,
            "permite_preguntas": False,
            "descripcion": "Evaluación final del equipo"
        }
    }
}

# Configuración del formato RETOR
FORMATO_RETOR = {
    "nombre": "Formato RETOR",
    "descripcion": "Formato de debate académico con 4 fases y 5 ítems de evaluación",
    "fases": {
        DebateFaseRETOR.CONTEXTUALIZACION: {
            "criterios": [
                "comprension_mocion_desarrollo",
                "relevancia_informacion",
                "argumentacion_refutacion",
                "oratoria_persuasion",
                "trabajo_equipo_formato"
            ],
            "tiempo_minutos": 6,
            "permite_dividir_intervencion": True,
            "minuto_protegido": True,
            "permite_preguntas": True,
            "permite_minuto_oro": True,
            "descripcion": "Fase de discusión de hechos y establecimiento de contexto"
        },
        DebateFaseRETOR.DEFINICION: {
            "criterios": [
                "comprension_mocion_desarrollo",
                "relevancia_informacion",
                "argumentacion_refutacion",
                "oratoria_persuasion",
                "trabajo_equipo_formato"
            ],
            "tiempo_minutos": 2,
            "permite_dividir_intervencion": True,
            "minuto_protegido": True,
            "permite_preguntas": True,
            "permite_minuto_oro": True,
            "descripcion": "Fase de definición de conceptos relevantes"
        },
        DebateFaseRETOR.VALORACION: {
            "criterios": [
                "comprension_mocion_desarrollo",
                "relevancia_informacion",
                "argumentacion_refutacion",
                "oratoria_persuasion",
                "trabajo_equipo_formato"
            ],
            "tiempo_minutos": 5,
            "permite_dividir_intervencion": True,
            "minuto_protegido": False,
            "permite_preguntas": True,
            "permite_minuto_oro": True,
            "descripcion": "Fase de comparación de argumentos y refutación"
        },
        DebateFaseRETOR.CONCLUSION: {
            "criterios": [
                "comprension_mocion_desarrollo",
                "relevancia_informacion",
                "argumentacion_refutacion",
                "oratoria_persuasion",
                "trabajo_equipo_formato"
            ],
            "tiempo_minutos": 3,
            "permite_dividir_intervencion": False,
            "minuto_protegido": False,
            "permite_preguntas": False,
            "permite_minuto_oro": False,
            "descripcion": "Fase de cierre y resumen del debate"
        }
    }
}

# Mapeo de nombres de fases a enums para cada formato
FASES_UPCT = {
    "Introducción": DebateFaseUPCT.INTRO,
    "Refutación 1": DebateFaseUPCT.REF1,
    "Refutación 2": DebateFaseUPCT.REF2,
    "Conclusión": DebateFaseUPCT.CONCLUSION,
    "Final": DebateFaseUPCT.FINAL
}

FASES_RETOR = {
    "Contextualización": DebateFaseRETOR.CONTEXTUALIZACION,
    "Definición": DebateFaseRETOR.DEFINICION,
    "Valoración": DebateFaseRETOR.VALORACION,
    "Conclusión": DebateFaseRETOR.CONCLUSION
}


def get_formato_config(format_type: str) -> Dict:
    """
    Obtiene la configuración de un formato de debate.
    
    Args:
        format_type: Tipo de formato ('UPCT' o 'RETOR')
    
    Returns:
        Diccionario con la configuración del formato
    """
    if format_type == DebateFormat.RETOR:
        return FORMATO_RETOR
    return FORMATO_UPCT


def get_fases_mapping(format_type: str) -> Dict:
    """
    Obtiene el mapeo de nombres de fases para un formato.
    
    Args:
        format_type: Tipo de formato ('UPCT' o 'RETOR')
    
    Returns:
        Diccionario de mapeo nombre -> enum
    """
    if format_type == DebateFormat.RETOR:
        return FASES_RETOR
    return FASES_UPCT


def get_criterios_por_fase(format_type: str, fase_nombre: str) -> List[str]:
    """
    Obtiene los criterios de evaluación para una fase específica.
    
    Args:
        format_type: Tipo de formato ('UPCT' o 'RETOR')
        fase_nombre: Nombre de la fase
    
    Returns:
        Lista de criterios para la fase
    """
    config = get_formato_config(format_type)
    fases_mapping = get_fases_mapping(format_type)
    
    fase_enum = fases_mapping.get(fase_nombre)
    if fase_enum and fase_enum in config["fases"]:
        return config["fases"][fase_enum]["criterios"]
    return []


def get_formatos_disponibles() -> List[Dict]:
    """
    Retorna lista de formatos disponibles con información básica.
    
    Returns:
        Lista de diccionarios con nombre, descripción y código de cada formato
    """
    return [
        {
            "codigo": DebateFormat.UPCT,
            "nombre": FORMATO_UPCT["nombre"],
            "descripcion": FORMATO_UPCT["descripcion"],
            "num_fases": len(FORMATO_UPCT["fases"])
        },
        {
            "codigo": DebateFormat.RETOR,
            "nombre": FORMATO_RETOR["nombre"],
            "descripcion": FORMATO_RETOR["descripcion"],
            "num_fases": len(FORMATO_RETOR["fases"])
        }
    ]


def validar_formato(format_type: str) -> bool:
    """
    Valida si un tipo de formato es válido.
    
    Args:
        format_type: Tipo de formato a validar
    
    Returns:
        True si es válido, False en caso contrario
    """
    return format_type in [DebateFormat.UPCT, DebateFormat.RETOR]
