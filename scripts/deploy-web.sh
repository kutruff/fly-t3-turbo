#!/bin/bash

set -e
usage() { echo "Usage: $0" 1>&2; exit 1; }

while getopts ":a:" opt; do
    case "${opt}" in
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

flyctl deploy -c deployment/web.toml --local-only