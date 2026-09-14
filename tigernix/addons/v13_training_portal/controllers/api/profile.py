import json
import logging

from tigernix import http
from tigernix.http import request

from .helper.decorators import api_handler
from .helper.responses import success
from .helper.exceptions import ValidationException

_logger = logging.getLogger(__name__)

class Profile(http.Controller):
    @http.route(
        '/training/update_profile',
        type='http',
        auth='user',
        methods=['POST'],
        csrf=False
    )
    @api_handler
    def update_profile(
        self,
        **kwargs
    ):
        payload = json.loads(request.httprequest.data.decode('utf-8'))
        
        title = (payload.get('title') or '').strip()
        name = (payload.get('name') or '').strip()
        mobile = (payload.get('mobile') or '').strip()
        date = (payload.get('birthdate') or '').strip()
        country = (payload.get('country') or '').strip()
        state = (payload.get('state') or '').strip()
        city = (payload.get('city') or '').strip()

        user = request.env.user
        
        # cari country
        country_rec = False
        if country:
            country_rec = request.env['res.country'].sudo().search(
                [('code', 'ilike', country)],
                limit=1
            )

        # cari state
        state_rec = False
        if state:
            domain = [
                ('code', 'ilike', state)
            ]

        if country_rec:
            domain.append(
                ('country_id', '=', country_rec.id)
            )

        state_rec = request.env[
            'res.country.state'
        ].sudo().search(
            domain,
            limit=1
        )

        # update user
        user.sudo().write({
            'name': name,
        })

        # update partner
        user.partner_id.sudo().write({
            'title': title,
            'date': date,
            'mobile': mobile,
            'city': city,
            'country_id':
                country_rec.id if country_rec else False,
            'state_id':
                state_rec.id if state_rec else False,
        })
        
        return success(
            message='Profile updated successfully.', 
            data={
                'name': user.name,
                'title': user.partner_id.title.id if user.partner_id.title else None,
                'birthdate': str(user.partner_id.date) if user.partner_id.date else None,
                'mobile': user.partner_id.mobile,
                'city': user.partner_id.city,
                'state': user.partner_id.state_id.code if user.partner_id.state_id else None,
                'country': user.partner_id.country_id.code if user.partner_id.country_id else None,
            }
        )