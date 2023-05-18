SHELL := /usr/bin/env bash
PYTHON_VERSION := $(shell cat .python-version)
NODE_VERSION := $(shell cat .nvmrc)
COMPONENT_RENDERER_SERVICE_NAME := x-govuk-component-renderer

.PHONY: check_docker build authenticate_to_artifactory push_image prep_version_incrementor clean help compose
.DEFAULT_GOAL := help

build: prep_version_incrementor ## Build the docker image
	@echo '********** Building docker image ************'
	@pipenv run prepare-release
	@umask 0022
	@docker build --no-cache --build-arg NODE_VERSION=$(NODE_VERSION) -f docker/Dockerfile -t artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):$$(cat .version) .
	@docker tag artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):$$(cat .version) artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):latest

authenticate_to_artifactory:
	@docker login --username ${ARTIFACTORY_USERNAME} --password "${ARTIFACTORY_PASSWORD}"  artefacts.tax.service.gov.uk

push_image: ## Push the docker image to artifactory
	@docker push artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):$$(cat .version)
	@docker push artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):latest
	@pipenv run cut-release

prep_version_incrementor:
	@echo "Renaming requirements to prevent pipenv trying to convert it"
	@echo "Installing version-incrementor with pipenv"
	@pip install pipenv -i https://artefacts.tax.service.gov.uk/artifactory/api/pypi/pips/simple --upgrade
	@pipenv --python $(PYTHON_VERSION)
	@pipenv run pip install -i https://artefacts.tax.service.gov.uk/artifactory/api/pypi/pips/simple 'version-incrementor<2'

clean: ## Remove the docker image
	@echo '********** Cleaning up ************'
	@docker rmi -f $$(docker images artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):$$(cat .version) -q)
	@docker rmi -f $$(docker images artefacts.tax.service.gov.uk/$(COMPONENT_RENDERER_SERVICE_NAME):latest -q)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
