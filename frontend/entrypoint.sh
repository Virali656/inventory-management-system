#!/bin/sh
# This script is used in Dockerfile to set environment variables at build time

# Replace environment variable placeholder in built files
if [ -n "$REACT_APP_API_URL" ]; then
    echo "Setting API URL to: $REACT_APP_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|$REACT_APP_API_URL|g" {} \;
fi

# Start nginx
exec nginx -g 'daemon off;'
