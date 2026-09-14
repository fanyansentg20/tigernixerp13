import logging
from functools import wraps

from .exceptions import ApiException
from .responses import error

_logger = logging.getLogger(__name__)

def api_handler(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ApiException as e:
            return error(
                title=e.title,
                message=e.message,
                status=e.status_code
            )
        except Exception as e:
            _logger.exception(e)
            return error(
                title=type(e).__name__,
                message=str(e),
                status=500
            )

    return wrapper