# Part of TigernixERP. See LICENSE file for full copyright and licensing details.
# -*- coding: utf-8 -*-

import tigernix.tests


@tigernix.tests.tagged('post_install', '-at_install')
class TestUi(tigernix.tests.HttpCase):
    def test_ui(self):
        self.start_tour("/web", 'industry_fsm_tour', login="admin")
