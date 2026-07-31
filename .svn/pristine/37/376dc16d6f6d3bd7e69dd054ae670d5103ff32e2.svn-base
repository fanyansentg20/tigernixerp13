# Part of TigernixERP. See LICENSE file for full copyright and licensing details.
from tigernix import models, api


class ResCompany(models.Model):

    _inherit = "res.company"

    @api.onchange('country_id')
    def onchange_country(self):
        """In Peru, the rounding method it's calculated as global"""
        for rec in self.filtered(lambda x: x.country_id == self.env.ref('base.pe')):
            rec.tax_calculation_rounding_method = 'round_globally'
