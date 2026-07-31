# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import tigernix

# ----------------------------------------------------------
# Monkey patch release to set the edition as 'enterprise'
# ----------------------------------------------------------
tigernix.release.version_info = tigernix.release.version_info[:5] + ('e',)
if '+e' not in tigernix.release.version:     # not already patched by packaging
    tigernix.release.version = '{0}+e{1}{2}'.format(*tigernix.release.version.partition('-'))

tigernix.service.common.RPC_VERSION_1.update(
    server_version=tigernix.release.version,
    server_version_info=tigernix.release.version_info)
