"""
Configuration Management for SpendSense Backend API

Handles environment-specific configuration for development, staging, and production.
"""

import os
from enum import Enum
from typing import Optional
from pydantic import BaseSettings


class Environment(str, Enum):
    """Application environment types"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    
    Attributes are automatically populated from env vars with matching names
    """
    
    # Application
    APP_NAME: str = "SpendSense Operator Dashboard API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = True
    
    # Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    VERCEL_DOMAIN: Optional[str] = None
    
    # Database
    USE_FIRESTORE: bool = False
    DATABASE_URL: str = "spendsense.db"
    
    # Firebase/Firestore
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_CREDENTIALS: Optional[str] = None
    
    # Authentication
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours
    
    # OpenAI (Optional - for LLM features)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_TEMPERATURE: float = 0.7
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # AWS (if using AWS services)
    AWS_REGION: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def get_cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        
        # Add Vercel domain if in production
        if self.ENVIRONMENT == Environment.PRODUCTION and self.VERCEL_DOMAIN:
            origins.append(f"https://{self.VERCEL_DOMAIN}")
            # Allow preview deployments
            origins.append(f"https://*.{self.VERCEL_DOMAIN}")
        
        return origins
    
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == Environment.PRODUCTION
    
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == Environment.DEVELOPMENT
    
    def should_use_firestore(self) -> bool:
        """Determine if Firestore should be used"""
        # Use Firestore if explicitly enabled OR in production with Firebase config
        return (
            self.USE_FIRESTORE or 
            (self.is_production() and self.FIREBASE_PROJECT_ID is not None)
        )


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """
    Get application settings
    
    Returns:
        Settings instance with current configuration
    """
    return settings


def print_config_summary():
    """Print configuration summary (safe - doesn't print secrets)"""
    config = get_settings()
    
    print("\n" + "=" * 70)
    print(f"  {config.APP_NAME} - Configuration")
    print("=" * 70)
    print(f"  Environment:        {config.ENVIRONMENT.value}")
    print(f"  Debug Mode:         {config.DEBUG}")
    print(f"  API Host:           {config.API_HOST}:{config.API_PORT}")
    print(f"  Database:           {'Firestore' if config.should_use_firestore() else 'SQLite'}")
    if config.should_use_firestore():
        print(f"  Firebase Project:   {config.FIREBASE_PROJECT_ID or 'Not set'}")
    print(f"  CORS Origins:       {len(config.get_cors_origins())} configured")
    print(f"  OpenAI Enabled:     {'Yes' if config.OPENAI_API_KEY else 'No'}")
    print(f"  Log Level:          {config.LOG_LEVEL}")
    print("=" * 70 + "\n")

