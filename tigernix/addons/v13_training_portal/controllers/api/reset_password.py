import json

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ValidationException

from tigernix.addons.auth_signup.controllers.main import AuthSignupHome


class ResetPassword(http.Controller):
  @http.route('/training/reset_password', type='http', methods=['POST'], auth='public', csrf=False)
  @api_handler
  def reset_password(self):
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    token = (payload.get('token') or '').strip()
    new_password = (payload.get('newPassword') or '').strip()
    confirm_password = (payload.get('confirmPassword') or '').strip()
    
    if not new_password or not confirm_password:
      raise ValidationException('new password and confirm password are required.')
    
    if new_password != confirm_password:
      raise ValidationException('Password confirmation mismatch.')
    
    values = { 'password': new_password }
    
    request.env['res.users'].sudo().signup(
        values,
        token
    )
    
    request.session['reset_password_succeeded'] = True
    return success(message='Password reset successfully.')