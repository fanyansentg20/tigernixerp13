# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix.tests


@tigernix.tests.tagged('-at_install', 'post_install')
class TestUi(tigernix.tests.HttpCase):
    def test_ui(self):
        self.start_tour("/web", 'approvals_tour', login='admin')
