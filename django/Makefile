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

activate:
	. $(VENV_BIN_DIR)/activate

migrate:
	@$(PYTHON) manage.py migrate

migrations:
	@$(PYTHON) manage.py makemigrations api

createsuperuser:
	@$(PYTHON) manage.py createsuperuser

run:
	@$(PYTHON) manage.py runserver 8080

format: activate
	find api timerecorder utils -name '*.py' -exec autopep8 --in-place --aggressive --aggressive {} \;
