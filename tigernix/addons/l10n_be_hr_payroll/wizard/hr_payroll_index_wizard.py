# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models


class HrPayrollIndex(models.TransientModel):
    _inherit = 'hr.payroll.index'

    def _index_wage(self, contract):
        # Not calling super is intended as wage is completely replaced by wage_with_holidays
        contract.write({'wage_with_holidays': contract.wage_with_holidays + contract.wage_with_holidays * self.percentage / 100})
