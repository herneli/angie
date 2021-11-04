import KcAdminClient from '@keycloak/keycloak-admin-client';


async function keycloakAdmin() {

    const configuration = {
        baseUrl: process.env.KEYCLOAK_URL,
        realmName: process.env.KEYCLOAK_REALM,
    }

    const kcAdminClient = new KcAdminClient(configuration);

    await kcAdminClient.auth({
        grantType : 'client_credentials',
        clientId: process.env.KEYCLOAK_ADMIN_CLI,
        clientSecret: process.env.KEYCLOAK_ADMIN_SECRET
    });

  
    setInterval(() => kcAdminClient.auth({
        grantType : 'client_credentials',
        clientId: process.env.KEYCLOAK_ADMIN_CLI,
        clientSecret: process.env.KEYCLOAK_ADMIN_SECRET
    }), 300 * 1000); 

    return kcAdminClient;

    
}

export {
    keycloakAdmin,
    
};