from datetime import datetime, timedelta
from tigernix.tests import common
import tigernix.tests


@tigernix.tests.tagged('post_install','-at_install', 'unlink_constraints')
class TestUnlinkConstraints(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestUnlinkConstraints, cls).setUpClass()
        MODEL = cls.env['test_new_api.model_constrained_unlinks']

        cls.deletable_bar = MODEL.create({'bar': 5})
        cls.undeletable_bar = MODEL.create({'bar': 6})
        cls.deletable_foo = MODEL.create({'foo': 'formaggio'})
        cls.undeletable_foo = MODEL.create({'foo': 'prosciutto'})

        from tigernix.addons.base.models.ir_model import (  # noqa: PLC0415
            MODULE_UNINSTALL_FLAG,
        )
        uninstall = {MODULE_UNINSTALL_FLAG: True}
        cls.undeletable_bar_uninstall = cls.undeletable_bar.with_context(**uninstall)
        cls.undeletable_foo_uninstall = cls.undeletable_foo.with_context(**uninstall)

    def test_unlink_constraint_manual_bar(self):
        self.assertTrue(self.deletable_bar.unlink())
        with self.assertRaises(ValueError, msg="Nooooooooo bar can't be greater than five!!"):
            self.undeletable_bar.unlink()

    def test_unlink_constraint_uninstall_bar(self):
        self.assertTrue(self.deletable_bar.unlink())
        # should succeed since it's at_uninstall=False
        self.assertTrue(self.undeletable_bar_uninstall.unlink())

    def test_unlink_constraint_manual_foo(self):
        self.assertTrue(self.deletable_foo.unlink())
        with self.assertRaises(ValueError, msg="You didn't say if you wanted it crudo or cotto..."):
            self.undeletable_foo.unlink()

    def test_unlink_constraint_uninstall_foo(self):
        self.assertTrue(self.deletable_foo)
        # should fail since it's at_uninstall=True
        with self.assertRaises(ValueError, msg="You didn't say if you wanted it crudo or cotto..."):
            self.undeletable_foo_uninstall.unlink()
