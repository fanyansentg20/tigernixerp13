# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models


class Digest(models.Model):
    _inherit = 'digest.digest'

    def compute_kpis_actions(self, company, user):
        res = super(Digest, self).compute_kpis_actions(company, user)
        res['kpi_website_sale_total'] = 'website_sale_dashboard.sale_dashboard&menu_id=%s' % self.env.ref('website.menu_website_configuration').id
        return res
