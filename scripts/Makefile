VENV_BIN_DIR = venv/bin
PIP = "$(VENV_BIN_DIR)/pip"
PYTHON = "$(VENV_BIN_DIR)/python"

define create-venv
python3 -m venv venv
endef

.PHONY: venv
venv:
	@$(create-venv)
	@$(PIP) install -r requirements.txt

run:
	@$(PYTHON) ./update_db_from_client.py 