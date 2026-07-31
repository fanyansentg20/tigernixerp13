# Part of TigernixERP. See LICENSE file for full copyright and licensing details
from tigernix import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    l10n_pe_district = fields.Many2one(
        'l10n_pe.res.city.district', string='District',
        help='Districts are part of a province or city.')