class ApiException(Exception):
  status_code = 400
  title = "Bad Request"

  def __init__(self, message):
      self.message = message
      super().__init__(message)


class ValidationException(ApiException):
  status_code = 400
  title = "Validation Error" # Bad Request


class UnauthorizedException(ApiException):
  status_code = 401
  title = "Unauthorized" # Authentication Failed


class ForbiddenException(ApiException):
  status_code = 403
  title = "Forbidden" # Access Denied


class NotFoundException(ApiException):
  status_code = 404
  title = "Not Found" # Resource Not Found


class ConflictException(ApiException):
  status_code = 409
  title = "Conflict" # Resource Already Exists


class InternalServerException(ApiException):
  status_code = 500
  title = "Internal Server Error" # Server Error