#!/bin/bash

set -e
usage() { echo "Usage: $0 [-a <app-name>]" 1>&2; exit 1; }

while getopts ":a:" opt; do
    case "${opt}" in
        a)
            APP_NAME=${OPTARG}
            ;;            
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [[ -z "${APP_NAME}" ]]; then
    usage
fi

DB_MIGRATOR_APP_NAME="${APP_NAME}-db-migrator"
DB_MIGRATOR_IMAGE_TAG="registry.fly.io/${DB_MIGRATOR_APP_NAME}"

PROJECT_ROOT=${BASH_SOURCE%/*}/../..
docker build -t ${DB_MIGRATOR_IMAGE_TAG} -f ${PROJECT_ROOT}/packages/db-migrate/Dockerfile .

