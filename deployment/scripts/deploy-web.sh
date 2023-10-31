#!/bin/bash

set -e
usage() { echo "Usage: $0" 1>&2; exit 1; }

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

flyctl deploy -c ${BASH_SOURCE%/*}/../${APP_NAME}.toml --local-only