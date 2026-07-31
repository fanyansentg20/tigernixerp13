# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

{
    'name': 'IoT Box Homepage',
    'category': 'Sales/Point Of Sale',
    'sequence': 6,
    'website': 'https://www.tigernix.com/page/point-of-sale-hardware',
    'summary': 'A homepage for the IoT Box',
    'description': """
IoT Box Homepage
================

This module overrides TigernixERP web interface to display a simple
Homepage that explains what's the iotbox and shows the status,
and where to find documentation.

If you activate this module, you won't be able to access the 
regular TigernixERP interface anymore.

""",
    'depends': ['hw_proxy'],
    'installable': False,
}
