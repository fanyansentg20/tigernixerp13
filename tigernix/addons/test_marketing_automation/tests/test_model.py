# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import fields, models


class MarketingAutomationTestSimple(models.Model):
    _description = 'Another Test Simple Chatter Record'
    _name = 'test_marketing_automation.test.simple'
    _inherit = ['mail.thread']

    name = fields.Char()
    email_from = fields.Char()
    description = fields.Text()
    partner_id = fields.Many2one('res.partner', 'Partner')
