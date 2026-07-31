# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix.tests


@tigernix.tests.common.at_install(False)
@tigernix.tests.common.post_install(True)
class TestUi(tigernix.tests.HttpCase):
    def test_ui(self):
        self.start_tour("/web", 'sign_widgets_tour', login='admin')
