# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import json

from tigernix import http
from tigernix.http import request
from tigernix.tools.translate import _


    
def _apply_cors(response):
    """Attach CORS headers, reflecting the request's Origin to support
    credentials from any origin."""
    origin = request.httprequest.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Vary'] = 'Origin'
    return response


class WebsiteBackend(http.Controller):

    @http.route('/website/fetch_dashboard_data', type="json", auth='user')
    def fetch_dashboard_data(self, website_id, date_from, date_to):
        Website = request.env['website']
        has_group_system = request.env.user.has_group('base.group_system')
        has_group_designer = request.env.user.has_group('website.group_website_designer')
        dashboard_data = {
            'groups': {
                'system': has_group_system,
                'website_designer': has_group_designer
            },
            'currency': request.env.company.currency_id.id,
            'dashboards': {
                'visits': {},
            }
        }

        current_website = website_id and Website.browse(website_id) or Website.get_current_website()
        multi_website = request.env.user.has_group('website.group_multi_website')
        websites = multi_website and request.env['website'].search([]) or current_website
        dashboard_data['websites'] = websites.read(['id', 'name'])
        for rec, website in zip(websites, dashboard_data['websites']):
            website['domain'] = rec._get_http_domain()
            if website['id'] == current_website.id:
                website['selected'] = True

        if has_group_designer:
            if current_website.google_management_client_id and current_website.google_analytics_key:
                dashboard_data['dashboards']['visits'] = dict(
                    ga_client_id=current_website.google_management_client_id or '',
                    ga_analytics_key=current_website.google_analytics_key or '',
                )
        return dashboard_data

    @http.route('/website/dashboard/set_ga_data', type='json', auth='user')
    def website_set_ga_data(self, website_id, ga_client_id, ga_analytics_key):
        if not request.env.user.has_group('base.group_system'):
            return {
                'error': {
                    'title': _('Access Error'),
                    'message': _('You do not have sufficient rights to perform that action.'),
                }
            }
        if not ga_analytics_key or not ga_client_id.endswith('.apps.googleusercontent.com'):
            return {
                'error': {
                    'title': _('Incorrect Client ID / Key'),
                    'message': _('The Google Analytics Client ID or Key you entered seems incorrect.'),
                }
            }
        Website = request.env['website']
        current_website = website_id and Website.browse(website_id) or Website.get_current_website()

        request.env['res.config.settings'].create({
            'google_management_client_id': ga_client_id,
            'google_analytics_key': ga_analytics_key,
            'website_id': current_website.id,
        }).execute()
        return True

    @http.route('/website/register_new_user', type='http', auth='public', cors='*', csrf=False, methods=['POST', 'OPTIONS'])
    @http.route('/website/register_new_user', type='http', auth='public', cors='*', csrf=False, methods=['OPTIONS'])
    def register_new_user_preflight(self, **kwargs):
        """Handles the browser's CORS preflight for register_new_user."""
        return _apply_cors(request.make_response(''))
 
    @http.route('/website/register_new_user', type='json', auth='public', cors='*', csrf=False, methods=['POST'])
    def register_new_user(self, **post):
        """Public endpoint to register a new portal user (JSON-RPC style POST)."""
        raw = request.jsonrequest or {}
        params = raw.get('params', raw) if isinstance(raw, dict) else {}
 
        name = (params.get('name') or post.get('name') or '').strip()
        email = (params.get('email') or post.get('email') or '').strip()
        password = params.get('password') or post.get('password') or ''
 
        if not name or not email or not password:
            return {
                'error': {
                    'title': _('Missing Information'),
                    'message': _('Name, email, and password are required.'),
                }
            }
 
        existing_user = request.env['res.users'].sudo().search(
            [('login', '=', email)], limit=1
        )
        if existing_user:
            return {
                'error': {
                    'title': _('Registration Failed'),
                    'message': _('An account with this email already exists.'),
                }
            }
 
        portal_group = request.env.ref('base.group_portal')
        new_user = request.env['res.users'].sudo().create({
            'name': name,
            'login': email,
            'email': email,
            'password': password,
            'groups_id': [(6, 0, [portal_group.id])],
        })
 
        return {'success': True, 'user_id': new_user.id}
    
    @http.route('/website/list_users', type='http', auth='public', methods=['GET'], csrf=False)
    def list_users(self, **kwargs):
        """Public GET endpoint listing users, optionally filtered by name or email.
 
        Query params:
            search  -- optional text matched against name OR email (partial, case-insensitive)
 
        Example:
            GET /website/list_users
            GET /website/list_users?search=jane
        """
        search = (kwargs.get('search') or '').strip()
 
        domain = []
        if search:
            domain = ['|', ('name', 'ilike', search), ('email', 'ilike', search)]
 
        users = request.env['res.users'].sudo().search(domain)
        data = [{
            'name': user.name,
            'email': user.email,
            'login': user.login,
        } for user in users]
 
        return request.make_response(
            json.dumps({'count': len(data), 'users': data}),
            headers=[('Content-Type', 'application/json')],
        )
 