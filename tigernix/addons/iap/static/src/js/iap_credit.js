tigernix.define('iap.redirect_tigernix_credit_widget', function(require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');


var IapTigernixCreditRedirect = AbstractAction.extend({
    template: 'iap.redirect_to_tigernix_credit',
    events : {
        "click .redirect_confirm" : "tigernix_redirect",
    },
    init: function (parent, action) {
        this._super(parent, action);
        this.url = action.params.url;
    },

    tigernix_redirect: function () {
        window.open(this.url, '_blank');
        this.do_action({type: 'ir.actions.act_window_close'});
        // framework.redirect(this.url);
    },

});
core.action_registry.add('iap_tigernix_credit_redirect', IapTigernixCreditRedirect);
});
