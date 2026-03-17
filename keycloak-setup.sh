#!/bin/bash
# Setup Keycloak realm and user for MaskAnyone

KCADM="/opt/keycloak/bin/kcadm.sh"

# Login to admin (credentials from environment, fallback to 'dev' for local setup)
$KCADM config credentials --server http://localhost:8080/auth --realm master \
    --user "${KEYCLOAK_ADMIN:-dev}" --password "${KEYCLOAK_ADMIN_PASSWORD:-dev}"

# Create maskanyone realm
$KCADM create realms -s realm=maskanyone -s enabled=true

# Create maskanyone-fe client
$KCADM create clients -r maskanyone -s clientId=maskanyone-fe -s publicClient=true -s 'redirectUris=["https://localhost/*", "http://localhost/*"]' -s 'webOrigins=["*"]' -s directAccessGrantsEnabled=true

# Create a test user
$KCADM create users -r maskanyone -s username=researcher -s enabled=true -s email=researcher@example.com -s firstName=Test -s lastName=Researcher

# Set password for user
$KCADM set-password -r maskanyone --username researcher --new-password researcher

echo "Keycloak setup complete!"
echo "Login with: researcher / researcher"
