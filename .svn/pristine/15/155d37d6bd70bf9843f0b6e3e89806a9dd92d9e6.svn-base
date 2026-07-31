# Part of TigernixERP. See LICENSE file for full copyright and licensing details.
from tigernix import fields, models


class IrSequence(models.Model):

    _inherit = 'ir.sequence'

    l10n_latam_journal_id = fields.Many2one('account.journal', 'Journal')
    l10n_latam_document_type_id = fields.Many2one('l10n_latam.document.type', 'Document Type')
