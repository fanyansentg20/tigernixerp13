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
  @http.route('/training/register', type='http', auth="public", website=True)
  def training_register(self, **kwargs):
    print("1asdhajskasjdkasd")
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    # try:
    #     request.website.get_template('website.website_info').name
    # except Exception as e:
    #     return request.env['ir.http']._handle_exception(e, 404)
    # Module = request.env['ir.module.module'].sudo()
    # apps = Module.search([('state', '=', 'installed'), ('application', '=', True)])
    # l10n = Module.search([('state', '=', 'installed'), ('name', '=like', 'l10n_%')])
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
        # 'apps': apps,
        # 'l10n': l10n,
        # 'version': tigernix.service.common.exp_version()
    }
    return request.render('v13_training_portal.register', values)

  @http.route('/training/login', type='http', auth="public", website=True)
  def training_login(self, **kwargs):
    print("1asdhajskasjdkasd")
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    # try:
    #     request.website.get_template('website.website_info').name
    # except Exception as e:
    #     return request.env['ir.http']._handle_exception(e, 404)
    # Module = request.env['ir.module.module'].sudo()
    # apps = Module.search([('state', '=', 'installed'), ('application', '=', True)])
    # l10n = Module.search([('state', '=', 'installed'), ('name', '=like', 'l10n_%')])
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
        # 'apps': apps,
        # 'l10n': l10n,
        # 'version': tigernix.service.common.exp_version()
    }
    return request.render('v13_training_portal.login', values)

  @http.route('/training/dashboard', type='http', auth="public", website=True)
  def training_dashboard(self, **kwargs):
    print("1asdhajskasjdkasd")
    partner_object = request.env['res.partner'].sudo().browse(47)
    title_object = request.env['res.partner.title'].sudo().search([])
    # try:
    #     request.website.get_template('website.website_info').name
    # except Exception as e:
    #     return request.env['ir.http']._handle_exception(e, 404)
    # Module = request.env['ir.module.module'].sudo()
    # apps = Module.search([('state', '=', 'installed'), ('application', '=', True)])
    # l10n = Module.search([('state', '=', 'installed'), ('name', '=like', 'l10n_%')])
    values = {
        'message': 'Permulaan',
        'partner': partner_object,
        'title_object': title_object,
        # 'apps': apps,
        # 'l10n': l10n,
        # 'version': tigernix.service.common.exp_version()
    }
    return request.render('v13_training_portal.dashboard', values)