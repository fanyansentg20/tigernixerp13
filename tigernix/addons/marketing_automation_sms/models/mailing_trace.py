# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import api, fields, models, _
from tigernix.fields import Datetime


class MailingTrace(models.Model):
    _inherit = 'mailing.trace'

    def set_failed(self, failure_type):
        traces = self.env['marketing.trace'].search([
            ('mailing_trace_ids', 'in', self.ids)])
        traces.write({
            'state': 'error',
            'schedule_date': Datetime.now(),
            'state_msg': _('SMS failed')
        })
        return super(MailingTrace, self).set_failed(failure_type)
