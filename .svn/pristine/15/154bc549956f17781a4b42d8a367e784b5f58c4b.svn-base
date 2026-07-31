# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

import inspect
import logging

from tigernix import api, models
from tigernix.exceptions import AccessDenied

_logger = logging.getLogger(__name__)

def is_autovacuum(method):
    """ Return whether ``method`` is an autovacuum method. """
    return callable(method) and getattr(method, '_autovacuum', False)


class AutoVacuum(models.AbstractModel):
    """ Expose the vacuum method to the cron jobs mechanism. """
    _name = 'ir.autovacuum'
    _description = 'Automatic Vacuum'

    @api.model
    def power_on(self, *args, **kwargs):
        """ Perform a complete database cleanup by safely calling every ``@api.autovacuum`` decorated method. """
        if not self.env.is_admin():
            raise AccessDenied()

        for model in self.env.values():
            cls = self.env.registry[model._name]
            for attr, method in inspect.getmembers(cls, is_autovacuum):
                _logger.debug('Calling %s.%s()', model, attr)

                try:
                    method(model)
                    self.env.cr.commit()
                except Exception:
                    _logger.exception('Failed %s.%s()', model, attr)
                    self.env.cr.rollback()

        return True
