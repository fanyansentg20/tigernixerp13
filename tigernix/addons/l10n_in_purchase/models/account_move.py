# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import api, models


class AccountMove(models.Model):
    _inherit = 'account.move'

    @api.onchange('purchase_vendor_bill_id', 'purchase_id')
    def _onchange_purchase_auto_complete(self):
        if self.purchase_vendor_bill_id.purchase_order_id or self.purchase_id:
            journal_id = self.purchase_vendor_bill_id.purchase_order_id.l10n_in_journal_id or self.purchase_id.l10n_in_journal_id
            if journal_id:
                self.journal_id = journal_id
        return super()._onchange_purchase_auto_complete()
