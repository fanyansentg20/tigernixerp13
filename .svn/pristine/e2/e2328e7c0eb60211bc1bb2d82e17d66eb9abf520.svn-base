# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models
from tigernix.http import request

class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        res = super(IrHttp, self).session_info()
        company_id = res['company_id']
        res['company_currency_id'] = request.env['res.company'].browse(company_id).currency_id.id if company_id else None
        return res
