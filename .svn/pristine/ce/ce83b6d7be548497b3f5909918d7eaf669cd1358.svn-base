# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import fields, models


class QualityCheck(models.Model):
    _inherit = "quality.check"

    ip = fields.Char(related='point_id.device_id.iot_id.ip_url')
    identifier = fields.Char(related='point_id.device_id.identifier')
    device_name = fields.Char(related='point_id.device_id.name', size=30, string='Device Name: ')
