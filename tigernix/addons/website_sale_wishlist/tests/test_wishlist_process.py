# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.
import tigernix.tests


@tigernix.tests.common.at_install(False)
@tigernix.tests.common.post_install(True)
class TestUi(tigernix.tests.HttpCase):
    def test_01_wishlist_tour(self):
        self.start_tour("/", 'shop_wishlist')
