# Shim de compatibilidade — main.py importa daqui.
# O código foi dividido em módulos coesos — ver ARCHITECTURE.md Fase 2.
from presentation_builder import build_presentation  # noqa: F401
from slide_registry import get_available_slides, is_slide_available  # noqa: F401
