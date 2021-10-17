import axios from "axios";
import T from "i18n-react/dist/i18n-react";
import Config from "./Config";

const TranslationLoader = {
    loadTranslations: async (callback) => {
        let lang = Config.getCurrentLang();
        try {
            let result = await axios({
                method: "get",
                url: "/translation",
                params: { lang: lang },
                headers: {
                    Authorization: undefined,
                    "Content-Type": "application/json",
                },
            });

            let fallback = Config.getAppFallbackLang();
            let fallbackObj;
            if (lang !== fallback) {
                //Si son la misma, no se obtiene y listo, ahorramos una llamada
                fallbackObj = await axios({
                    method: "get",
                    url: "/translation",
                    params: { lang: fallback },
                    headers: {
                        Authorization: undefined,
                        "Content-Type": "application/json",
                    },
                });
            }

            T.setTexts(result.data.data, {
                // notFound: (key) => {
                //     if (
                //         key &&
                //         fallbackObj &&
                //         fallbackObj.data &&
                //         fallbackObj.data.data[0]
                //     ) {
                //         return fallbackObj.data.data[0].items[key];
                //     }
                // },
            });
            if (callback) callback();
        } catch (error) {
            console.log("error cargando traducciones");
        }
    },
};

export default TranslationLoader;
