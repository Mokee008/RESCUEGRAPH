.PHONY: install test lint format clean data-guard-test

install:
	pip install -e ".[dev,ui]"

test:
	pytest tests/ -v --cov=src/floodsat

data-guard-test:
	pytest tests/test_data_guard.py -v

lint:
	ruff check src/ tests/ scripts/

format:
	ruff format src/ tests/ scripts/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov .ruff_cache build/ dist/ *.egg-info
