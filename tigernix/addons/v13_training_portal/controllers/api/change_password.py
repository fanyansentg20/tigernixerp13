import json

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ValidationException

class ChangePassword(http.Controller):
  @http.route(
    '/training/send_password_otp',
    type='http',
    auth='user',
    csrf=False
  )
  @api_handler
  def send_password_otp(self):
    user = request.env.user
    otp = user.generate_otp(
      'change_password'
    )

    user.partner_id.message_post(
      subject='Password Change OTP',
      body=f'''
          OTP Code: {otp.otp_code}

          Valid for 5 minutes.
      '''
    )
    mail = request.env['mail.mail'].sudo().create({
    'subject': 'Change Password OTP',
    'email_to': user.email,
    'body_html': f'''
        <h3>Your OTP</h3>
        <p>{otp.otp_code}</p>
        <p>Expires in 5 minutes</p>
    '''
    })
    mail.send()
    
    return success(message='OTP sent successfully')
    
  @http.route('/training/change_password', type='http', auth='user', csrf=False)
  @api_handler
  def change_password(self):
    user = request.env.user
    
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    otp_code = (payload.get('otp_code') or '').strip()
    new_password = (payload.get('new_password') or '').strip()
    confirm_password = (payload.get('confirm_password') or '').strip()

    if new_password != confirm_password:
      raise ValidationException('Password confirmation mismatch.')

    if not user.verify_otp(
      otp_code,
      'change_password'
    ):
      raise ValidationException('OTP invalid or expired.')

    user.sudo().write({
      'password': new_password
    })
    
    return success(message='Password updated successfully')
