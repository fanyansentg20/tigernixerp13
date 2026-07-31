import tigernix.tests
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.


@tigernix.tests.tagged('post_install', '-at_install')
class TestUi(tigernix.tests.HttpCase):
    def test_01_event_configurator(self):
        self.start_tour("/web", 'event_configurator_tour', login="admin")
