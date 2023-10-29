#!/bin/bash

set -e
usage() { echo "Usage: $0 -r <region> -o <org-name> -a <web-app-name>" 1>&2; exit 1; }

while getopts ":r:o:a:" opt; do
    case "${opt}" in
        r)
            REGION=${OPTARG}
            ;;
        o)
            ORG=${OPTARG}
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

DB_NAME="postgres"
DB_APP_NAME="${APP_NAME}-db"
DB_MIGRATOR_APP_NAME="${APP_NAME}-db-migrator"

ORG_ARGS=""

if [[ -n "${ORG}" ]]; then
    echo "${ORG}"
    ORG_ARGS="--org $ORG"
fi

read -p "Enter DISCORD_CLIENT_SECRET:" DISCORD_CLIENT_SECRET
read -p "Enter NEXTAUTH_SECRET:" NEXTAUTH_SECRET

flyctl apps create ${ORG_ARGS} --name ${APP_NAME}
flyctl apps create ${ORG_ARGS} --machines --name ${DB_MIGRATOR_APP_NAME}

flyctl secrets import --stage -c deployment/web.toml << SECRETS_EOF
DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
SECRETS_EOF

flyctl pg create --name ${DB_APP_NAME} --region ${REGION} ${ORG_ARGS}

flyctl pg attach --yes -a ${APP_NAME} --database-name ${DB_NAME} ${DB_APP_NAME} 
flyctl pg attach --yes -a ${DB_MIGRATOR_APP_NAME} --database-name ${DB_NAME} ${DB_APP_NAME} 

${BASH_SOURCE%/*}/build-db-migrator.sh -a ${APP_NAME}
${BASH_SOURCE%/*}/deploy-db-migrator.sh -a ${APP_NAME} -r ${REGION}
${BASH_SOURCE%/*}/deploy-web.sh
