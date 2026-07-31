# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details

from tigernix.addons.industry_fsm.tests.test_fsm_flow import TestFsmFlow

class TestFsmStock(TestFsmFlow):

    def test_fsm_flow(self):
        super(TestFsmStock, self).test_fsm_flow()
        self.assertEqual(self.task.sale_order_id.picking_ids.mapped('state'), ['done'], "Pickings should be set as done")
