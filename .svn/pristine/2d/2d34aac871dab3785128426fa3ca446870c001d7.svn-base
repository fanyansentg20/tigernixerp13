# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import api, models


class AccountMove(models.Model):
    _inherit = 'account.move'

    @api.onchange('partner_shipping_id')
    def _onchange_partner_shipping_id(self):
        res = super(AccountMove, self)._onchange_partner_shipping_id()
        self.intrastat_country_id = self._get_invoice_intrastat_country_id()
        return res
