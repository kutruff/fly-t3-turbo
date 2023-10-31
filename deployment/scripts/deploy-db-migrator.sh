#!/bin/bash

set -e
usage() { echo "Usage: $0 -r <region> -a <app-name> " 1>&2; exit 1; }

while getopts ":a:r:" opt; do
    case "${opt}" in
        r)
            REGION=${OPTARG}
            ;;
        a)
            APP_NAME=${OPTARG}
            ;;            
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [[ -z "${REGION}" ]] || [[ -z "${APP_NAME}" ]]; then
    usage
fi

DB_MIGRATOR_APP_NAME="${APP_NAME}-db-migrator"
DB_MIGRATOR_IMAGE_TAG="registry.fly.io/${DB_MIGRATOR_APP_NAME}"

docker push ${DB_MIGRATOR_IMAGE_TAG}
flyctl machine run \
    --detach \
    --region ${REGION} \
    --vm-memory 512 \
    --rm \
    --restart no \
    --app ${DB_MIGRATOR_APP_NAME} \
    ${DB_MIGRATOR_IMAGE_TAG} 

