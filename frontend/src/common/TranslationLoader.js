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
                params: { lang: lang }
            });

            T.setTexts(result.data.data);

            if (callback) callback();
        } catch (error) {
            console.log("error cargando traducciones");
        }
    },
};

export default TranslationLoader;
