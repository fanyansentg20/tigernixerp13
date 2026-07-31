# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models
from tigernix.http import request


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        result = super(IrHttp, self).session_info()

        if result['is_system']:
            # necessary keys for Studio
            result['dbuuid'] = request.env['ir.config_parameter'].sudo().get_param('database.uuid')
            result['multi_lang'] = len(request.env['res.lang'].get_installed()) > 1

        return result
