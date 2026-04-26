from loguru import logger
import sys

logger.remove()

logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> - {message}",
    level="INFO"
)

logger.add(
    "logs/finsight.log",
    rotation="10 MB",
    retention="10 days",
    level="DEBUG"
)