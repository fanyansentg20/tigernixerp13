-- disable paypal payment acquirer
UPDATE payment_acquirer SET paypal_email_account = NULL;
