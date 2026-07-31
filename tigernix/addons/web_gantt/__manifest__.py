# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

{
    'name': 'Web Gantt',
    'category': 'Hidden',
    'description': """
TigernixERP Web Gantt chart view.
=================================

""",
    'version': '2.0',
    'depends': ['web'],
    'data' : [
        'views/web_gantt_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': True,
    'license': 'OEEL-1',
}
