import base64
import datetime
import json
import os
import logging
import pytz
import requests
import werkzeug.utils
import werkzeug.wrappers

from itertools import islice
from xml.etree import ElementTree as ET

import tigernix

from tigernix import http, models, fields, _
from tigernix.http import request
from tigernix.tools import OrderedSet
from tigernix.addons.http_routing.models.ir_http import slug, _guess_mimetype
from tigernix.addons.web.controllers.main import Binary
from tigernix.addons.portal.controllers.portal import pager as portal_pager
from tigernix.addons.portal.controllers.web import Home

logger = logging.getLogger(__name__)

class training(http.Controller):
  @http.route(['/', '/dashboard', '/countries', '/profile', '/about'], type='http', auth='public', website=True)
  def homepage(self, **kw):
    if not request.session.uid:
      return werkzeug.utils.redirect('/training/login', 303)
    
    title_object = request.env['res.partner.title'].sudo().search([])

    user = request.env.user
    partner = user.partner_id
    
    userData = {
      'name': user.name,
      'title': partner.title.id if partner.title else None,
      'birthdate': str(partner.date) if partner.date else None,
      'mobile': partner.mobile,
      'city': partner.city,
      'state': partner.state_id.code if partner.state_id else None,
      'country': partner.country_id.code if partner.country_id else None,
    }
    
    values = {
      'titleObject': title_object,
      'userData': userData,
      'json': json
    }
    return request.render('website.homepage', values)

  @http.route('/training/register', type='http', auth="public", website=True)
  def training_register(self, **kwargs):
    if request.session.uid:
      return werkzeug.utils.redirect('/', 303)
    
    title_object = request.env['res.partner.title'].sudo().search([])
    values = {
      'titleObject': title_object,
      'json': json
    }
    return request.render('v13_training_portal.register', values)
      
  @http.route('/training/register/success', type='http', auth="public", website=True)
  def register_success(self, **kwargs):
    if not request.session.get('just_registered'):
      return request.redirect('/')
    
    request.session.pop('just_registered', None)    
    
    return request.render('v13_training_portal.register_success')
  
  @http.route('/web/login', type='http', auth='public')
  def web_login_redirect(self, **kw):
    query = request.httprequest.query_string.decode()
    
    redirect_url = '/training/login'
    
    if query:
      redirect_url += '?' + query
    
    return werkzeug.utils.redirect(redirect_url)


  @http.route('/training/login', type='http', auth="public", website=True)
  def training_login(self, **kwargs):
    if request.session.uid:
      return werkzeug.utils.redirect('/', 303)
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
        # 'apps': apps,
        # 'l10n': l10n,
        # 'version': tigernix.service.common.exp_version()
    }
    return request.render('v13_training_portal.login', values)
  
  @http.route('/training/change-email', type='http', auth="public", website=True)
  def training_change_email(self, **kwargs):
    if not request.session.uid:
      return werkzeug.utils.redirect('/training/login', 303)
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
    }
    return request.render('v13_training_portal.change_email', values)

  @http.route('/training/change-password', type='http', auth="public", website=True)
  def training_change_password(self, **kwargs):
    if not request.session.uid:
      return werkzeug.utils.redirect('/training/login', 303)
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
    }
    return request.render('v13_training_portal.change_password', values)
  
  @http.route('/training/forgot-password', type='http', auth="public", website=True)
  def training_forgot_password(self, **kwargs):
    if request.session.uid:
      return werkzeug.utils.redirect('/', 303)
    
    return request.render('v13_training_portal.forgot_password')
  
  @http.route('/training/forgot-password/success', type='http', auth="public", website=True)
  def training_forgot_password_success(self, **kwargs):
    if not request.session.get('forgot_password_email_sent') or request.session.uid:
      return request.redirect('/')
    
    request.session.pop('forgot_password_email_sent', None)
    
    return request.render('v13_training_portal.forgot_password_success')
  
  @http.route('/training/reset-password', type='http', auth="public", website=True)
  def training_reset_password(self, **kwargs):
    token = kwargs.get('token')
    
    isValidToken = request.env['res.partner'].sudo()._check_reset_password_token(token)
    
    if not token or not isValidToken or request.session.uid:
      return request.redirect('/')
    
    return request.render('v13_training_portal.reset_password')
  
  @http.route('/training/reset-password/success', type='http', auth="public", website=True)
  def training_reset_password_success(self, **kwargs):
    if not request.session.get('reset_password_succeeded') or request.session.uid:
      return request.redirect('/')
    
    request.session.pop('reset_password_succeeded', None)
    
    return request.render('v13_training_portal.reset_password_success')