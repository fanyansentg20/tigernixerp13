# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import fields, models


class Survey(models.Model):
    _inherit = 'survey.survey'

    category = fields.Selection(selection_add=[('hr_recruitment', 'Recruitment')])
