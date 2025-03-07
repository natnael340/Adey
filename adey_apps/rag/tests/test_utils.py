import pytest
from adey_apps.rag.utils import URLTextLoader

pytestmark = pytest.mark.django_db


def test_url_text_loader_success(mocker):
    test_url = "https://example.com/sample.txt"
    expected_text = "Hello, this is a sample text file."

    mocked_request = mocker.patch("adey_apps.rag.utils.requests.get")
    mocked_request.return_value.text = expected_text
    
    loader = URLTextLoader(test_url)
    result = loader.load()

    assert result == expected_text, "The loader should return the expected text."