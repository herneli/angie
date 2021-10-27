import KcAdminClient from '@keycloak/keycloak-admin-client';


async function keycloakAdmin() {

    const configuration = {
        baseUrl: 'http://localhost:3114/auth',
        realmName: 'Angie',
    }

    const kcAdminClient = new KcAdminClient(configuration);

    await kcAdminClient.auth({
        grantType : 'client_credentials',
        clientId: 'admin-cli',
        clientSecret: 'c219ef63-4359-482e-8545-32cb028f6642'
    });

  
    setInterval(() => kcAdminClient.auth({
        grantType : 'client_credentials',
        clientId: 'admin-cli',
        clientSecret: 'c219ef63-4359-482e-8545-32cb028f6642'
    }), 300 * 1000); 

    return kcAdminClient;

    
}

export {
    keycloakAdmin,
    
};