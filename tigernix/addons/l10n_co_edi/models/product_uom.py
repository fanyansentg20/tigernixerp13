# coding: utf-8
from tigernix import api, fields, models, _


class ProductUom(models.Model):
    _inherit = 'uom.uom'

    l10n_co_edi_ubl = fields.Char(string=u'Código UBL')
