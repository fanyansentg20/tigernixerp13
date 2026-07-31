-- disable stripe payment acquirer
UPDATE payment_acquirer SET stripe_secret_key = NULL, stripe_publishable_key = NULL;
