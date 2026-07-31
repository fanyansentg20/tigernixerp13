import tigernix.tests
from tigernix.tools import mute_logger


@tigernix.tests.common.tagged('post_install', '-at_install')
class TestWebsiteError(tigernix.tests.HttpCase):

    @mute_logger('tigernix.addons.http_routing.models.ir_http', 'tigernix.http')
    def test_01_run_test(self):
        self.start_tour("/test_error_view", 'test_error_website')
