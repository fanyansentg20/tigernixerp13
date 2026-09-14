import json

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ValidationException

class ForgotPassword(http.Controller):
  @http.route('/training/forgot_password', type='http', auth='public', csrf=False)
  @api_handler
  def forgot_password(self):
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    email = (payload.get('email') or '').strip()

    if not email:
      raise ValidationException('Email is required.')

    user = request.env['res.users'].sudo().search([
      ('login', '=', email)
    ], limit=1)

    if not user:
      raise ValidationException('No user found with this email.')
    
    request.env['res.users'].sudo().reset_password(email)
    request.session['forgot_password_email_sent'] = True
    
    return success(message='Password reset instructions sent to your email.')