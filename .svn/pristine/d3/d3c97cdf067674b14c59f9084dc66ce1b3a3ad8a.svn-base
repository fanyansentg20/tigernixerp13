import tigernix.tests
from tigernix.tools import mute_logger


@tigernix.tests.common.tagged('post_install', '-at_install')
class TestWebsiteSession(tigernix.tests.HttpCase):

    def test_01_run_test(self):
        self.start_tour('/', 'test_json_auth')
