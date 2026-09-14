import json

from tigernix import http
from tigernix.http import request
from tigernix.tools.translate import _

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ValidationException, ConflictException

class Register(http.Controller):
  @http.route('/training_v13/register_new_user', type='http', methods=['POST'], auth='public', csrf=False)
  @api_handler
  def register_new_user(
    self,
    **kwargs
  ):
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    
    title = (payload.get('title') or '').strip()
    date = (payload.get('date') or '').strip()
    name = (payload.get('name') or '').strip()
    email = (payload.get('email') or '').strip()
    password = payload.get('password') or ''
    mobile = (payload.get('mobile') or '').strip()
    country = (payload.get('country') or '').strip()
    state = (payload.get('state') or '').strip()
    city = (payload.get('city') or '').strip()

    if not name or not email or not password:
      raise ValidationException(
        "Name, email, and password are required."
      )

    existing_user = request.env['res.users'].sudo().search(
      [('login', '=', email)], limit=1
    )

    if existing_user:
      raise ConflictException(
        "An account with this email already exists."
      )

    country_rec = False
    state_rec = False

    if country:
      country_rec = request.env['res.country'].sudo().search([
        ('code', 'ilike', country)
      ], limit=1)

    if state:
      domain = [('code', 'ilike', state)]

    if country_rec:
      domain.append(('country_id', '=', country_rec.id))

    state_rec = request.env['res.country.state'].sudo().search(
      domain,
      limit=1
    )

    portal_group = request.env.ref('base.group_portal')

    new_user = request.env['res.users'].sudo().create({
        'name': name,
        'login': email,
        'email': email,
        'password': password,
        'groups_id': [(6, 0, [portal_group.id])],
    })
    new_user.partner_id.sudo().write({
        'title': title,
        'date': date,
        'mobile': mobile,
        'city': city,
        'country_id': country_rec.id if country_rec else False,
        'state_id': state_rec.id if state_rec else False,
    })
    
    request.session['just_registered'] = True
    
    return success(
      data={
        'user_login': new_user.name
      },
      message="Registration successful."
    )