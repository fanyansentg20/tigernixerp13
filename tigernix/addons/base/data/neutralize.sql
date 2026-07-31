-- deactivate mail servers
UPDATE ir_mail_server SET active = false;

-- insert dummy mail server to prevent using fallback servers specified using command line
UPDATE ir_mail_server
SET
    name = 'neutralization - disable emails',
    smtp_port = '1025',
    smtp_host = 'invalid',
    smtp_encryption = 'none',
    smtp_user = '123',
    smtp_pass='123';

-- deactivate crons
UPDATE ir_cron
SET active = false
WHERE id NOT IN (SELECT res_id
                 FROM ir_model_data
                 WHERE model = 'ir.cron'
                   AND name = 'autovacuum_job'
                   AND module = 'base');

-- neutralization flag for the database
INSERT INTO ir_config_parameter (key, value)
VALUES ('database.is_neutralized', true)
ON CONFLICT (key) DO UPDATE SET value = true;
