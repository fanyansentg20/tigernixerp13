-- disable generic payment provider
UPDATE payment_acquirer
SET state = 'disabled'
WHERE state NOT IN ('test', 'disabled');
