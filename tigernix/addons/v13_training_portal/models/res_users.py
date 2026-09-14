# -*- coding: utf-8 -*-
# Part of TigernixERP. See LICENSE file for full copyright and licensing details.
import logging
import random

from datetime import datetime, timedelta
from tigernix import api, fields, models, tools, _
from tigernix.exceptions import ValidationError, UserError
from tigernix.http import request

_logger = logging.getLogger(__name__)

def now(**kwargs):
    return datetime.now() + timedelta(**kwargs)

class ResUsers(models.Model):
    _inherit = 'res.users'

    website_id = fields.Many2one('website', related='partner_id.website_id', store=True, related_sudo=False, readonly=False)

    _sql_constraints = [
        # Partial constraint, complemented by a python constraint (see below).
        ('login_key', 'unique (login, website_id)', 'You can not have two users with the same login!'),
    ]

    def _has_unsplash_key_rights(self):
        self.ensure_one()
        if self.has_group('website.group_website_designer'):
            return True
        return super(ResUsers, self)._has_unsplash_key_rights()
    
    def generate_otp(self, otp_type, target_email=None):
        self.ensure_one()
        otp_code = str(random.randint(100000, 999999))
        
        # Hapus OTP lama yang belum dipakai
        self.env['user.otp'].sudo().search([
            ('user_id', '=', self.id),
            ('otp_type', '=', otp_type),
            ('is_used', '=', False)
        ]).unlink()
        
        otp_record = self.env['user.otp'].sudo().create({
            'user_id': self.id,
            'otp_code': otp_code,
            'otp_type': otp_type,
            'target_email': target_email,
            'expired_at': fields.Datetime.now() + timedelta(minutes=5),
            'is_used': False,
        })

        return otp_record
    
    def verify_otp(self, otp_code, otp_type):
        self.ensure_one()

        otp = self.env['user.otp'].sudo().search([
            ('user_id', '=', self.id),
            ('otp_type', '=', otp_type),
            ('otp_code', '=', otp_code),
            ('is_used', '=', False),
        ], limit=1)

        if not otp:
            return False

        if otp.expired_at < fields.Datetime.now():
            return False

        otp.sudo().write({
            'is_used': True
        })
        
        return otp

    @api.constrains('login', 'website_id')
    def _check_login(self):
        """ Do not allow two users with the same login without website """
        self.flush(['login', 'website_id'])
        self.env.cr.execute(
            """SELECT login
                 FROM res_users
                WHERE login IN (SELECT login FROM res_users WHERE id IN %s AND website_id IS NULL)
                  AND website_id IS NULL
             GROUP BY login
               HAVING COUNT(*) > 1
            """,
            (tuple(self.ids),)
        )
        if self.env.cr.rowcount:
            raise ValidationError(_('You can not have two users with the same login!'))

    @api.model
    def _get_login_domain(self, login):
        website = self.env['website'].get_current_website()
        return super(ResUsers, self)._get_login_domain(login) + website.website_domain()

    @api.model
    def _signup_create_user(self, values):
        current_website = self.env['website'].get_current_website()
        if request and current_website.specific_user_account:
            values['company_id'] = current_website.company_id.id
            values['company_ids'] = [(4, current_website.company_id.id)]
            values['website_id'] = current_website.id
        new_user = super(ResUsers, self)._signup_create_user(values)
        return new_user

    @api.model
    def _get_signup_invitation_scope(self):
        current_website = self.env['website'].get_current_website()
        return current_website.auth_signup_uninvited or super(ResUsers, self)._get_signup_invitation_scope()

    @classmethod
    def authenticate(cls, db, login, password, user_agent_env):
        """ Override to link the logged in user's res.partner to website.visitor """
        uid = super(ResUsers, cls).authenticate(db, login, password, user_agent_env)
        if uid:
            with cls.pool.cursor() as cr:
                env = api.Environment(cr, uid, {})
                visitor_sudo = env['website.visitor']._get_visitor_from_request()
                if visitor_sudo:
                    partner = env.user.partner_id
                    partner_visitor = env['website.visitor'].sudo().search([('partner_id', '=', partner.id)])
                    if partner_visitor and partner_visitor.id != visitor_sudo.id:
                        visitor_sudo.website_track_ids.write({'visitor_id': partner_visitor.id})
                        visitor_sudo.unlink()
                    else:
                        vals = {
                            'partner_id': partner.id,
                            'name': partner.name
                        }
                        visitor_sudo.write(vals)
        return uid