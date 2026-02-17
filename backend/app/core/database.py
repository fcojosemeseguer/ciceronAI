from tinydb import TinyDB, Query
from app.core.security import get_password_hash, verify_password
from uuid import uuid4

db = TinyDB('db.json')
users_table = db.table('users')
projects_table = db.table('projects')
analysis_table = db.table('analysis')
User = Query()


def create_user(data: dict):
    try:
        user_name = data["user"]
        user_code = str(uuid4())
        existing_user = users_table.get(User.user == user_name)

        if existing_user:
            print(f"user {user_name} already exists")
            return "user_exists"

        hashed_pswd = get_password_hash(data["pswd"])

        result = users_table.insert({
            'user': user_name,
            'pswd': hashed_pswd,
            'code': user_code,
            'name': data.get("name", user_name.split('@')[0])  # Usar nombre proporcionado o parte del email
        })

        return True if result else False

    except Exception as e:
        print(f"unexpected error: {e}")
        return False


def check_user(data: dict) -> bool:
    try:
        user = data["user"]
        pswd = data["pswd"]
        result = users_table.search(User.user == user)
        if not result:
            return False
        return verify_password(pswd, result[0]["pswd"])
    except Exception as e:
        print(f"error {e}")
        return False


def get_user_code(data: dict) -> str:
    user = data["user"]
    result = users_table.search(User.user == user)
    if not result:
        raise ValueError("user not found")
    return result[0]["code"]


def get_user_data(data: dict) -> dict:
    """Obtiene todos los datos del usuario incluyendo nombre y email"""
    user = data["user"]
    result = users_table.search(User.user == user)
    if not result:
        raise ValueError("user not found")
    return result[0]


def create_project(data: dict):
    try:
        name = data["name"]
        desc = data["desc"]
        user_code = data["user_code"]
        format_type = data.get("format_type", "UPCT")  # Default: UPCT
        project_code = str(uuid4())
        result = projects_table.insert({
            'name': name,
            'desc': desc,
            'user_code': user_code,
            'code': project_code,
            'format_type': format_type
        })
        return project_code if project_code else None
    except Exception as e:
        print(f"unexpected error: {e}")
        return None


def get_project_format(project_code: str) -> str:
    """Obtiene el tipo de formato de un proyecto."""
    try:
        project = projects_table.get(User.code == project_code)
        if project:
            return project.get('format_type', 'UPCT')
        return 'UPCT'
    except Exception as e:
        print(f"error getting project format: {e}")
        return 'UPCT'


def create_analysis(data: dict) -> bool:
    try:
        fase = data["fase"]
        postura = data["postura"]
        orador = data["orador"]
        project_code = data["project_code"]
        criterios = data["criterios"]
        total = data["total"]
        max_total = data["max_total"]
        result = analysis_table.insert({
            "project_code": project_code,
            "fase": fase,
            "postura": postura,
            "orador": orador,
            "criterios": criterios,
            "total": total,
            "max_total": max_total
        })
        return True
    except Exception as e:
        print(f"unexpected error: {e}")
        return False


def get_projects(data: dict):
    try:
        user_code = data["user_code"]
        if user_code:
            return projects_table.search(User.user_code == user_code)
        return []
    except Exception as e:
        print(f"error {e}")
        return []


def get_project(data: dict):
    try:
        user_code = data["user_code"]
        project_code = data["project_code"]
        if user_code is None or project_code is None:
            raise ValueError("missing data")
        project = projects_table.get(
            (User.code == project_code) & (User.user_code == user_code)
        )
        if not project:
            return None
        return analysis_table.search(User.project_code == project_code)
    except Exception as e:
        print(f"error {e}")
        return None


# Funciones stub para el sistema de archivos de audio
# Estas funciones deben ser implementadas completamente según la lógica del negocio

def check_team(project_code: str, equipo: str) -> bool:
    """Verifica si un equipo es válido para un proyecto."""
    # Stub: Implementar lógica real
    return equipo in ["A Favor", "En Contra"]


def save_audio_path(file_path, project_code, fase, equipo, orador, num_speakers):
    """Guarda la ruta del archivo de audio."""
    # Stub: Implementar lógica real
    pass


def get_audio_path(project_code, fase, equipo):
    """Obtiene la ruta del archivo de audio."""
    # Stub: Implementar lógica real
    return None


def check_user_existence(user_code: str) -> bool:
    """Verifica si un usuario existe."""
    try:
        result = users_table.search(User.code == user_code)
        return len(result) > 0
    except Exception:
        return False


def save_transcription(file_path, transcript, diarization_raw):
    """Guarda la transcripción."""
    # Stub: Implementar lógica real
    pass


def get_transcription(file_path):
    """Obtiene la transcripción."""
    # Stub: Implementar lógica real
    return {"transcript": [], "diarization": []}


def save_metrics(file_path, metrics):
    """Guarda las métricas."""
    # Stub: Implementar lógica real
    pass


def get_postura(equipo: str) -> str:
    """Obtiene la postura del equipo."""
    return equipo


def get_orador(file_path):
    """Obtiene el orador y número de speakers."""
    # Stub: Implementar lógica real
    return ("Orador 1", 2)


def get_saved_transcription_diarization(file_path):
    """Obtiene la transcripción y diarización guardadas."""
    # Stub: Implementar lógica real
    return ([], [])


def get_saved_metrics(file_path):
    """Obtiene las métricas guardadas."""
    # Stub: Implementar lógica real
    return {}
