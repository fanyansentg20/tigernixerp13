# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix.tests


@tigernix.tests.tagged('post_install', '-at_install')
class TestUi(tigernix.tests.HttpCase):
    def test_admin(self):
        self.start_tour("/", 'blog', login='admin')
