# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    def _timesheet_create_project(self):
        return super(SaleOrderLine, self.with_context(default_allow_forecast=True))._timesheet_create_project()
