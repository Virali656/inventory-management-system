#!/bin/sh
# This script is used to configure nginx at runtime

# Railway provides PORT env var - default to 80 if not set
PORT=${PORT:-80}

# Update nginx to listen on the correct port
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf

# Replace environment variable placeholder in built files (if needed)
if [ -n "$REACT_APP_API_URL" ]; then
    echo "Setting API URL to: $REACT_APP_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|$REACT_APP_API_URL|g" {} \;
fi

echo "Starting nginx on port $PORT..."

# Start nginx
exec nginx -g 'daemon off;'
