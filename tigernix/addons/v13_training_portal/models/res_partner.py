# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.

from tigernix import models

class ResPartner(models.Model):
  _inherit = 'res.partner'
  
  def _get_signup_url_for_action(
    self,
    url=None,
    action=None,
    view_type=None,
    menu_id=None,
    res_id=None,
    model=None
  ):
    res = super()._get_signup_url_for_action(
      url=url,
      action=action,
      view_type=view_type,
      menu_id=menu_id,
      res_id=res_id,
      model=model,
    )
    
    for partner_id, url in res.items():
      if url:
        res[partner_id] = url.replace(
          '/web/reset_password',
          '/training/reset-password'
        )
    
    return res
    
  def _check_reset_password_token(self, token):
    partner = self.search([('signup_token', '=', token)], limit=1)
    
    if not partner:
      return False
    
    return partner