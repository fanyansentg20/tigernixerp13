# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import fields, models


class HrReferralLevel(models.Model):
    _name = 'hr.referral.level'
    _description = 'Level for referrals'
    _order = 'points'

    name = fields.Char(required=True, string='Level Name')
    points = fields.Integer(required=True)
    image = fields.Binary(required=True)
