#!/bin/bash

usage() { echo "Usage: $0 -a <web-app-name> [-y]" 1>&2; exit 1; }

confirm() {
    # call with a prompt string or use a default
    read -r -p "${1:-Are you sure?} [y/N] " RESPONSE
    case "$RESPONSE" in
        [yY]) 
            echo "y"            
            ;;
        *)
            echo "n"            
            ;;
    esac
}

CONFIRMATION="n"
while getopts ":a:y?" opt; do
    case "${opt}" in
        y)
            CONFIRMATION=true
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

if [[ -z "${APP_NAME}" ]]; then
    usage
fi

if [[ "${CONFIRMATION}" = "n" ]]; then
    CONFIRMATION=$(confirm "Are you sure you want to destroy the project?")

    if [[ "${CONFIRMATION}" = "y" ]]; then
        read -r -p "Type the name of the web app: " RESPONSE
        if [[ "${RESPONSE}" != "${APP_NAME}" ]]; then
            echo "Project name incorrect. Aborting"
            exit 1
        fi  
    fi
fi

if [[ "${CONFIRMATION}" = "n" ]]; then
    echo "Aborting"
    exit 1
fi

DB_APP_NAME="${APP_NAME}-db"
DB_MIGRATOR_APP_NAME="${APP_NAME}-db-migrator"

echo Destroying all apps in project ${APP_NAME}

flyctl apps destroy -y ${DB_MIGRATOR_APP_NAME}
flyctl apps destroy -y ${APP_NAME}
flyctl apps destroy -y ${DB_APP_NAME} 
