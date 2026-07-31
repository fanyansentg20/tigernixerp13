# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import api, fields, models


class AccountMoveLine(models.Model):
    _inherit = 'account.move.line'

    # technical field used to reconcile the journal items in TigernixERP as they were in Winbooks
    winbooks_matching_number = fields.Char(help="Matching number that was used in Winbooks")
