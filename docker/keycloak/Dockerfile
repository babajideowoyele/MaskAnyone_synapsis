FROM quay.io/keycloak/keycloak:23.0.6 as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
ENV KC_DB=postgres

WORKDIR /opt/keycloak

# for demonstration purposes only, please make sure to use proper certificates in production instead
RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -validity 3650 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:23.0.6
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Database connection — credentials injected via env_file in docker-compose
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
ENV KC_HTTP_RELATIVE_PATH=/auth/
ENV KC_PROXY=edge

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
