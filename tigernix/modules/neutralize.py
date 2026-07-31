# -*- coding: utf-8 -*-

import logging
from contextlib import suppress
from typing import List, Iterable, Iterator

from tigernix.sql_db import Cursor
from tigernix.tools.misc import file_open


_logger = logging.getLogger(__name__)


def get_installed_modules(cursor: Cursor) -> List[str]:
    cursor.execute('''
        SELECT name
          FROM ir_module_module
         WHERE state IN ('installed', 'to upgrade', 'to remove');
    ''')
    return [result[0] for result in cursor.fetchall()]


def get_neutralization_queries(modules: Iterable[str]) -> Iterator[str]:
    # neutralization for each module
    for module in modules:
        filename = f'{module}/data/neutralize.sql'
        with suppress(FileNotFoundError, IOError):
            with file_open(filename) as file:
                yield file.read().strip()


def neutralize_database(cursor: Cursor) -> None:
    installed_modules = get_installed_modules(cursor)
    queries = get_neutralization_queries(installed_modules)
    errors = []

    for query in queries:
        try:
            with cursor.savepoint():
                cursor.execute(query)
        except Exception as e:
            _logger.warning(f"Neutralization query failed: {e}")
            errors.append(e)

    _logger.info("Neutralization finished")

    if errors:
        raise Exception(f"Neutralization completed with {len(errors)} errors")
