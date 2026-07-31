# -*- coding: utf-8 -*-

from __future__ import print_function
import argparse
import textwrap
import io
import sys
import os
import zipfile
from functools import partial
from inspect import cleandoc

import tigernix
from tigernix.tools import config
from tigernix.service.db import (
    dump_db,
    exp_create_database,
    exp_db_exist,
    exp_drop,
    exp_duplicate_database,
    exp_rename,
    restore_db,
)
from . import Command

import requests

try:
    # Python 3
    from urllib.parse import urlparse
except ImportError:
    # Python 2
    from urlparse import urlparse

eprint = partial(print, file=sys.stderr)


class Db(Command):
    """ Create, drop, dump, load databases """
    name = 'db'
    description = """
        Command-line version of the database manager.

        Commands are all filestore-aware.
    """
    epilog = None

    def run(self, cmdargs):
        parser = argparse.ArgumentParser(
            formatter_class=argparse.RawDescriptionHelpFormatter,
            prog='%s [--addons-path=PATH,]' % self.name,
            description=cleandoc(self.description or self.__doc__ or ""),
            epilog=cleandoc(self.epilog or ""),
        )
        parser.add_argument('-c', '--config')
        parser.add_argument('-D', '--data-dir')
        parser.add_argument('--addons-path')
        parser.add_argument('-r', '--db_user')
        parser.add_argument('-w', '--db_password')
        parser.add_argument('--pg_path')
        parser.add_argument('--db_host')
        parser.add_argument('--db_port')
        parser.add_argument('--db_sslmode')
        parser.set_defaults(func=lambda _: exit(parser.format_help()))

        subs = parser.add_subparsers(dest='subcommand')

        # INIT ----------------------------------
        init = subs.add_parser(
            "init",
            help="Create and initialize a database",
            description="Create an empty database and install base module",
            formatter_class=argparse.RawTextHelpFormatter,
        )
        init.set_defaults(func=self.init)
        init.add_argument('database', help="database to create")
        init.add_argument('--with-demo', action='store_true', help="install demo data")
        init.add_argument('--force', action='store_true', help="delete database if exists")
        init.add_argument('--language', default='en_US', help="default language (default: en_US)")
        init.add_argument('--username', default='admin', help="admin username (default: admin)")
        init.add_argument('--password', default='admin', help="admin password (default: admin)")
        init.add_argument('--country', help="country code for main company")
        init.epilog = textwrap.dedent("""\

                Database initialization will install the minimum required modules.
                To install more modules, use the `module install` command.
                For more info:

                $ odoo-bin module install --help
        """)

        # LOAD ----------------------------------
        load = subs.add_parser(
            "load",
            help="Load a dump file",
            description="Loads a dump file into tigernix. Dump file can be a URL.",
        )
        load.set_defaults(func=self.load)
        load.add_argument(
            '-f', '--force', action='store_const', default=False, const=True,
            help="delete database if exists"
        )
        load.add_argument(
            '--no-neutralize', action='store_false', dest='neutralize', default=True,
            help="skip database neutralization after restore (default: neutralize is ON)"
        )
        load.add_argument('database', nargs='?', help="database name (defaults to dump filename)")
        load.add_argument('dump_file', help="zip or pg_dump file to load")

        # DUMP ----------------------------------
        dump = subs.add_parser(
            "dump",
            help="Create a dump with filestore",
            description="Creates a dump file in zip format (with filestore)."
                        "To get pg_dump format, use dump_format argument.",
        )
        dump.set_defaults(func=self.dump)
        dump.add_argument('database', help="database to dump")
        dump.add_argument('dump_path', nargs='?', default='-', help="output path (default: stdout)")
        dump.add_argument('--format', dest='dump_format', choices=['zip', 'dump'], default='zip')
        dump.add_argument(
            '--no-filestore', action='store_const', dest='filestore', default=True, const=False,
            help="if passed, zip database is dumped without filestore (default: false)"
        )

        # DUPLICATE -----------------------------
        duplicate = subs.add_parser(
            "duplicate",
            help="Duplicate a database including filestore",
        )
        duplicate.set_defaults(func=self.duplicate)
        duplicate.add_argument(
            '-f', '--force', action='store_const', default=False, const=True,
            help="delete `target` database before copying if it exists"
        )
        duplicate.add_argument(
            '--no-neutralize', action='store_false', dest='neutralize', default=True,
            help="skip database neutralization after duplicate (default: neutralize is ON)"
        )
        duplicate.add_argument("source")
        duplicate.add_argument("target", help="database to copy `source` to, must not exist unless `-f` is specified in which case it will be dropped first")

        # RENAME --------------------------------
        rename = subs.add_parser(
            "rename",
            help="Rename a database including filestore",
        )
        rename.set_defaults(func=self.rename)
        rename.add_argument(
            '-f', '--force', action='store_const', default=False, const=True,
            help="delete `target` database before renaming if it exists"
        )
        rename.add_argument('source')
        rename.add_argument("target", help="database to rename `source` to, must not exist unless `-f` is specified, in which case it will be dropped first")

        # DROP ----------------------------------
        drop = subs.add_parser(
            "drop",
            help="Delete a database including filestore",
        )
        drop.set_defaults(func=self.drop)
        drop.add_argument('database', help="database to delete")

        args = parser.parse_args(cmdargs)

        # Parse config
        config_args = []
        for key in ['config', 'data_dir', 'addons_path', 'db_user', 'db_password',
                    'pg_path', 'db_host', 'db_port', 'db_sslmode']:
            val = getattr(args, key, None)
            if val is not None:
                opt_name = '--data-dir' if key == 'data_dir' else \
                          '--addons-path' if key == 'addons_path' else \
                          '--%s' % key
                config_args.extend([opt_name, val])

        if config_args:
            config.parse_config(config_args)

        # force db management active to bypass check when only a
        # `check_db_management_enabled` version is available.
        config['list_db'] = True
        tigernix.cli.server.report_configuration()

        args.func(args)

    def init(self, args):
        self._check_target(args.database, delete_if_exists=args.force)
        exp_create_database(
            db_name=args.database,
            demo=args.with_demo,
            lang=args.language,
            login=args.username,
            user_password=args.password,
            country_code=args.country,
            phone=None,
        )

    def load(self, args):
        db_name = args.database or os.path.splitext(os.path.basename(args.dump_file))[0]
        self._check_target(db_name, delete_if_exists=args.force)

        url = urlparse(args.dump_file)
        if url.scheme in ('http', 'https'):
            eprint("Fetching %s..." % args.dump_file)
            r = requests.get(args.dump_file, timeout=30)
            if not r.ok:
                exit("Unable to fetch %s: %s" % (args.dump_file, r.reason))

            eprint(" Done.")
            dump_file = io.BytesIO(r.content)
        else:
            eprint("Restoring %s..." % args.dump_file)
            dump_file = args.dump_file


        if not zipfile.is_zipfile(dump_file):
            exit("Not a zipped dump file, use `pg_restore` to restore raw dumps,"
                 " and `psql` to execute sql dumps or scripts.")

        restore_db(db_name, dump_file, copy=True, neutralize_database=args.neutralize)

    def dump(self, args):
        if args.dump_path == '-':
            dump_db(args.database, sys.stdout if sys.version_info[0] < 3 else sys.stdout.buffer,
                   args.dump_format)
        else:
            with open(args.dump_path, 'wb') as f:
                dump_db(args.database, f, args.dump_format, args.filestore)

    def duplicate(self, args):
        self._check_target(args.target, delete_if_exists=args.force)
        exp_duplicate_database(args.source, args.target, neutralize_database=args.neutralize)

    def rename(self, args):
        self._check_target(args.target, delete_if_exists=args.force)
        exp_rename(args.source, args.target)

    def drop(self, args):
        if not exp_drop(args.database):
            exit("Database '%s' does not exist." % args.database)

    def _check_target(self, target, *, delete_if_exists=False):
        if exp_db_exist(target):
            if delete_if_exists:
                exp_drop(target)
            else:
                sys.exit("Target database '%s' exists, aborting.\n\n"
                         "Use `--force` to delete the existing database anyway." % target)
