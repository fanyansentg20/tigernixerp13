# coding: utf-8
from tigernix import api, fields, models, _
from tigernix.exceptions import UserError, ValidationError


class TaxType(models.Model):
    _name = 'l10n_co_edi.tax.type'
    _description = "Colombian EDI Tax Type"

    name = fields.Char(string=u'Descripción', required=True)
    code = fields.Char(string=u'Código', required=True)
    retention = fields.Boolean(string=u'Retencion')
