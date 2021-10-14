const CracoLessPlugin = require('craco-less');

/* craco.config.js */
module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#1976D2',
                            '@menu-bg': '#1976D2',
                            '@menu-item-color': '#FFFFFF',
                            '@menu-highlight-color': '#FFFFFF'
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};