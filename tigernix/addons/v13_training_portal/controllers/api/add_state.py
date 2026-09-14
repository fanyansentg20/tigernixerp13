import json

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.exceptions import ConflictException, ValidationException
from .helper.responses import success

class AddState(http.Controller):
  @http.route('/training/add_state', type='http', auth='public', csrf=False)
  @api_handler
  def add_state(self):
    payload = json.loads(request.httprequest.data.decode('utf-8'))
    
    iso2 = (payload.get('iso2') or '').strip()
    name = (payload.get('name') or '').strip()
    countryIso2 = (payload.get('countryIso2') or '').strip()
    
    if not iso2 or not name or not countryIso2:
      raise ValidationException('ISO2, name, and country ISO2 are required.')
    
    country_rec = request.env['res.country'].sudo().search([
      ('code', '=', countryIso2)
    ], limit=1)
    
    existing_state = request.env['res.country.state'].sudo().search([
      ('code', '=', iso2),
      ('country_id', '=', country_rec.id)
    ], limit=1)

    if existing_state:
      raise ConflictException('State already exists.')
    
    new_state = request.env['res.country.state'].sudo().create({
      'name': name,
      'code': iso2,
      'country_id': country_rec.id
    })
    
    return success(
      data={
        'id': new_state.id
      },
      message='State added successfully'
    )