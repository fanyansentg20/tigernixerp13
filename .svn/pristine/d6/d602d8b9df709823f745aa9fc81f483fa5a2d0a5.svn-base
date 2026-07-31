import tigernix.tests
# @tigernix.tests.common.at_install(False)
# @tigernix.tests.common.post_install(True)
class TestUi(tigernix.tests.HttpCase):
    def test_01_ui(self):
        self.start_tour("/", 'activity_creation', login='admin')

    def test_02_ui(self):
        self.start_tour("/", 'test_screen_navigation', login='admin')
