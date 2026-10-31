import importlib
import pkgutil

import pytest

import adey_apps.rag

MODULES = [
    m.name for m in pkgutil.walk_packages(adey_apps.rag.__path__, "adey_apps.rag.")
    if ".migrations" not in m.name and ".tests" not in m.name
]

@pytest.mark.parametrize("module", MODULES)
def test_rag_module_imports(module):
    importlib.import_module(module)
