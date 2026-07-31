# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import api, models


class CouponReport(models.AbstractModel):
    _name = 'report.sale_coupon.report_coupon'
    _description = 'Sales Coupon Report'

    @api.model
    def _get_report_values(self, docids, data=None):
        docs = self.env['sale.coupon'].browse(docids)
        return {
            'doc_ids': docs.ids,
            'doc_model': 'sale.coupon',
            'data': data,
            'docs': docs,
        }
