# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import http
from tigernix.http import request
from tigernix.tools.translate import _
from tigernix.exceptions import AccessDenied

import werkzeug
import werkzeug.exceptions
import werkzeug.utils
from werkzeug.urls import iri_to_uri

db_monodb = http.db_monodb
def abort_and_redirect(url):
    r = request.httprequest
    response = werkzeug.utils.redirect(url, 302)
    response = r.app.get_response(r, response, explicit_session=False)
    werkzeug.exceptions.abort(response)
def ensure_db(redirect='/web/database/selector'):
    # This helper should be used in web client auth="none" routes
    # if those routes needs a db to work with.
    # If the heuristics does not find any database, then the users will be
    # redirected to db selector or any url specified by `redirect` argument.
    # If the db is taken out of a query parameter, it will be checked against
    # `http.db_filter()` in order to ensure it's legit and thus avoid db
    # forgering that could lead to xss attacks.
    db = request.params.get('db') and request.params.get('db').strip()

    # Ensure db is legit
    if db and db not in http.db_filter([db]):
        db = None

    if db and not request.session.db:
        # User asked a specific database on a new session.
        # That mean the nodb router has been used to find the route
        # Depending on installed module in the database, the rendering of the page
        # may depend on data injected by the database route dispatcher.
        # Thus, we redirect the user to the same page but with the session cookie set.
        # This will force using the database route dispatcher...
        r = request.httprequest
        url_redirect = werkzeug.urls.url_parse(r.base_url)
        if r.query_string:
            # in P3, request.query_string is bytes, the rest is text, can't mix them
            query_string = iri_to_uri(r.query_string)
            url_redirect = url_redirect.replace(query=query_string)
        request.session.db = db
        abort_and_redirect(url_redirect)

    # if db not provided, use the session one
    if not db and request.session.db and http.db_filter([request.session.db]):
        db = request.session.db

    # if no database provided and no database in session, use monodb
    if not db:
        db = db_monodb(request.httprequest)

    # if no db can be found til here, send to the database selector
    # the database selector will redirect to database manager if needed
    if not db:
        werkzeug.exceptions.abort(werkzeug.utils.redirect(redirect, 303))

    # always switch the session to the computed db
    if db != request.session.db:
        request.session.logout()
        abort_and_redirect(request.httprequest.url)

    request.session.db = db

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
        
    @http.route('/training_v13/register_new_user', type='json', auth='public', csrf=False)
    def register_new_user(self, name=None, email=None, password=None, **kwargs):
        """Public endpoint to register a new portal user.
 
        Works with a standard JSON-RPC body:
            {"jsonrpc": "2.0", "method": "call",
             "params": {"name": ..., "email": ..., "password": ...}}
        and also falls back to reading a flat JSON body (no "params" wrapper)
        if one is sent with Content-Type: application/json.
        """
        if not name or not email or not password:
            raw = request.jsonrequest or {}
            name = name or raw.get('name')
            email = email or raw.get('email')
            password = password or raw.get('password')
 
        name = (name or '').strip()
        email = (email or '').strip()
        password = password or ''
 
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

    @http.route('/training_v13/login_user', type='json', auth='public', csrf=False)
    def login_user(self, email=None, password=None, **kwargs):
        """Public endpoint to log in a portal user.
 
        Works with a standard JSON-RPC body:
            {"jsonrpc": "2.0", "method": "call",
             "params": {"email": ..., "password": ...}}
        and also falls back to reading a flat JSON body (no "params" wrapper)
        if one is sent with Content-Type: application/json.
        """
        ensure_db()
        if not email or not password:
            raw = request.jsonrequest or {}
            email = email or raw.get('email')
            password = password or raw.get('password')
 
        email = (email or '').strip()
        password = password or ''
 
        if not email or not password:
            return {
                'error': {
                    'title': _('Missing Information'),
                    'message': _('Email and password are required.'),
                }
            }
        # Log the user in by setting the session
        try:
            uid = request.session.authenticate(request.session.db, email, password)
        except AccessDenied:
            uid = False
            
        if not uid:
            return {
                'error': {
                    'title': _('Login Failed'),
                    'message': _('Invalid email or password.'),
                }
            }
 
        return {'success': True, 'user_id': uid}