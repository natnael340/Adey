import pytest
from adey_apps.rag.utils import URLTextLoader, clean_text

pytestmark = pytest.mark.django_db


def test_url_text_loader_success(mocker):
    test_url = "https://example.com/sample.txt"
    expected_text = "Hello, this is a sample text file."

    mocked_request = mocker.patch("adey_apps.rag.utils.requests.get")
    mocked_request.return_value.text = expected_text
    
    loader = URLTextLoader(test_url)
    result = loader.load()

    assert len(result) == 1
    assert result[0].page_content == clean_text(expected_text), "The loader should return the cleaned text."
    assert result[0].metadata == {"source": test_url}
    mocked_request.return_value.raise_for_status.assert_called_once()