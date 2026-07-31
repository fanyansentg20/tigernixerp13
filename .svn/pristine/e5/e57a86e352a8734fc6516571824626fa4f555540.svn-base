# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix.http import request
from tigernix.osv import expression

from tigernix.addons.project.controllers.portal import CustomerPortal


class ProjectCustomerPortal(CustomerPortal):

    def _task_get_page_view_values(self, task, access_token, **kwargs):
        values = super(ProjectCustomerPortal, self)._task_get_page_view_values(task, access_token, **kwargs)
        domain = request.env['account.analytic.line']._timesheet_get_portal_domain()
        domain = expression.AND([domain, [('task_id', '=', task.id)]])
        timesheets = request.env['account.analytic.line'].sudo().search(domain)
        values['timesheets'] = timesheets
        return values
