(function () {
"use strict";

tigernix.__DEBUG__.didLogInfo.then(function () {
    var modulesInfo = tigernix.__DEBUG__.jsModules;

    QUnit.module('Tigernix JS Modules');

    QUnit.test('all modules are properly loaded', function (assert) {
        assert.expect(2);

        assert.deepEqual(modulesInfo.missing, [],
            "no js module should be missing");
        assert.deepEqual(modulesInfo.failed, [],
            "no js module should have failed");
    });
});
})();
