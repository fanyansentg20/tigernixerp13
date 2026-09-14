from tigernix import fields, models

class UserOtp(models.Model):
    _name = 'user.otp'
    _description = 'User OTP'

    user_id = fields.Many2one(
        'res.users',
        required=True,
        ondelete='cascade'
    )

    otp_code = fields.Char(required=True)
    otp_type = fields.Selection([
        ('change_email', 'Change Email'),
        ('change_password', 'Change Password'),
        ('update_profile', 'Update Profile'),
    ], required=True)
    
    target_email = fields.Char()
    pending_data = fields.Text()
    expired_at = fields.Datetime()
    is_used = fields.Boolean(default=False)