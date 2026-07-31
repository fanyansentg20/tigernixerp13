import tigernix.tests


@tigernix.tests.tagged('post_install', '-at_install')
class TestUi(tigernix.tests.HttpCase):
    def test_admin(self):
        self.start_tour("/", 'event', login='admin')
