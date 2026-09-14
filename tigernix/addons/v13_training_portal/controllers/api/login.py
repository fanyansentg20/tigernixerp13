import json

from tigernix import http
from tigernix.http import request
from tigernix.exceptions import AccessDenied

from ..backend import ensure_db
from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import UnauthorizedException, ValidationException

class Login(http.Controller):
  @http.route('/training_v13/login_user', type='http', auth='public', csrf=False, methods=['POST'])
  @api_handler
  def login_user(self, **kwargs):
    """Public endpoint to log in a portal user.

    Works with a standard JSON-RPC body:
      {"jsonrpc": "2.0", "method": "call",
        "params": {"email": ..., "password": ...}}
    and also falls back to reading a flat JSON body (no "params" wrapper)
    if one is sent with Content-Type: application/json.
    """
    ensure_db()
    
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    
    email = (payload.get('email') or '').strip()
    password = payload.get('password') or ''

    if not email or not password:
      raise ValidationException(
        "Email and password are required."
      )
      
    # Log the user in by setting the session
    try:
      uid = request.session.authenticate(request.session.db, email, password)
    except AccessDenied:
      uid = False
        
    if not uid:
      raise UnauthorizedException(
        "Invalid email or password."
      )
    
    return success(
      data={'user_login': uid},
      message="Login successful"
    )
