# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix.tests.common import HttpCase, tagged


@tagged('post_install', '-at_install')
class TestMultiCompany(HttpCase):

    def test_company_in_context(self):
        """ Test website company is set in context """
        website = self.env['website'].browse(1)
        company = self.env['res.company'].create({'name': "Adaa"})
        website.company_id = company
        response = self.url_open('/multi_company_website')
        self.assertEqual(response.json()[0], company.id)
