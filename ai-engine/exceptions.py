"""Custom exception hierarchy for actionable pipeline failures."""

from __future__ import annotations


class AIEngineError(Exception):
    """Base exception for all expected AI-engine failures."""


class DataValidationError(AIEngineError):
    """Raised when dataset content or shape violates the model contract."""


class ModelError(AIEngineError):
    """Raised when training, model export, or model inference fails."""


class ArtifactValidationError(AIEngineError):
    """Raised when generated artifacts violate the cross-team contract."""


class ConfigurationError(AIEngineError):
    """Raised when canonical configuration is internally inconsistent."""
