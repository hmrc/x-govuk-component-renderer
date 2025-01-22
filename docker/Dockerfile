ARG NODE_VERSION
ARG DOCKERHUB=dockerhub.tax.service.gov.uk

# NodeJS docker images are tagged with:
# - the NodeJS version they provide
# - "-bullseye", the name of the debian distro they are built from
# - "-slim", to indicate they only include the minimal system packages
#   needed to run nodejs so the image is smaller with less security surface
# For more context https://hub.docker.com/_/node
FROM ${DOCKERHUB}/node:${NODE_VERSION}-bullseye-slim

ENV NPM_CONFIG_REGISTRY='https://artefacts.tax.service.gov.uk/artifactory/api/npm/npmjs'

WORKDIR /x-govuk-component-renderer

COPY ./docker/build.sh .
COPY ./docker/run.sh .
COPY ./server.js .
COPY ./package.json .
COPY ./package-lock.json .
COPY ./.nvmrc .
COPY ./src ./src

RUN . ./build.sh

CMD . ./run.sh
