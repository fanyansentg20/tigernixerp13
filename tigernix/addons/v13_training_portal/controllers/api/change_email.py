import json

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ConflictException, ValidationException

class ChangeEmail(http.Controller):
  @http.route(
    '/training/send_email_otp',
    type='http',
    auth='user',
    csrf=False
  )
  @api_handler
  def send_email_otp(
    self,
    **kwargs
  ):

    user = request.env.user
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    new_email = (payload.get('new_email') or '').strip()

    existing = request.env[
      'res.users'
    ].sudo().search([
      ('login', '=', new_email),
      ('id', '!=', user.id)
    ], limit=1) 

    if existing:
      raise ConflictException(
        "Email already exists."
      )

    otp = user.generate_otp(
      'change_email',
      target_email=new_email
    )

    user.partner_id.message_post(
      subject='Change Email OTP',
      body=f'''
        OTP Code: {otp.otp_code}

        New Email:
        {new_email}
      '''
    )
    
    mail = request.env['mail.mail'].sudo().create({
      'subject': 'Change Email OTP',
      'email_to': user.email,
      'body_html': f'''
        <h3>Your OTP</h3>
        <p>{otp.otp_code}</p>
        <p>Expires in 5 minutes</p>
      '''
    })
    mail.send()
    
    return success(message='OTP sent successfully')

  @http.route(
    '/training/change_email',
    type='http',
    auth='user',
    csrf=False
  )
  @api_handler
  def change_email(
    self,
    **kwargs
  ):

    user = request.env.user
    
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    otp_code = (payload.get('otp_code') or '').strip()

    otp = user.verify_otp(
      otp_code,
      'change_email'
    )

    if not otp:
      raise ValidationException('OTP invalid or expired.')

    user.sudo().write({
      'login': otp.target_email,
      'email': otp.target_email
    })
    
    return success(message='Email updated successfully', data={
      'email': otp.target_email
    })