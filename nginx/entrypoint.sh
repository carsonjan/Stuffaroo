#!/bin/sh
set -e

certificate=/etc/letsencrypt/live/stuffaroo.shop/fullchain.pem
current_certificate=
if [ -s "$certificate" ]; then
    cp /etc/nginx/stuffaroo/https.conf /etc/nginx/conf.d/default.conf
    current_certificate=$(sha256sum "$certificate" | cut -d ' ' -f 1)
else
    cp /etc/nginx/stuffaroo/stuffaroo.conf /etc/nginx/conf.d/default.conf
fi

# Enable HTTPS after Certbot obtains a certificate, and reload on renewal.
(
    while :; do
        if [ -s "$certificate" ]; then
            new_certificate=$(sha256sum "$certificate" | cut -d ' ' -f 1)
            if [ "$new_certificate" != "$current_certificate" ]; then
                cp /etc/nginx/stuffaroo/https.conf /etc/nginx/conf.d/default.conf
                if nginx -t && nginx -s reload; then
                    current_certificate=$new_certificate
                fi
            fi
        fi
        sleep 60
    done
) &

exec nginx -g 'daemon off;'
