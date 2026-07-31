# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix.tests

class WebSuite(tigernix.tests.HttpCase):
    def test_01_js(self):
        self.phantom_js('/web/tests?module=pos_blackbox_be.Order',"","", login='admin')
