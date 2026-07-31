# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix.tests


@tigernix.tests.tagged('post_install', '-at_install')
class TestUi(tigernix.tests.HttpCase):

    def test_01_point_of_sale_tour(self):
        self.start_tour("/web", 'point_of_sale_tour', login="admin")
