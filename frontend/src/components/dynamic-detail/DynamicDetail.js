import { Descriptions } from "antd";
import { JSONPath } from "jsonpath-plus";
import lodash from "lodash";
import moment from "moment";

/**
 * Construye un detalle en base a un objeto JSON y un patrón.
 * 
 * Estructura del patrón:
 * 
 * {
    "key_path": { <-- Clave JSONPath para acceder a la propiedad en el objeto
            label: "Text", <-- Texto a mostrar
            span: integer, <-- Colspan del elemento (parecido al colspan de las table)
            style: { <-- Style a aplicar sobre el contenido
                fontSize: "120%",
            },
            type: "date", <-- Tipo de datos especial: date
            format: "DD/MM/YYYY HH:mm:ss.SSS", <- Formato para el tipo de datos seleccionado 
        },
    }
 * 
 * @param {*} param0 
 * @returns 
 */
const DynamicDetail = ({ title, pattern, data, options }) => {
    const drawObject = (object) => {
        return lodash.map(object, (el, key) => {
            let label = el;
            let style = {};
            let format;
            let type;
            let span;
            if (typeof el === "object") {
                label = el.label;
                style = el.style;
                type = el.type;
                format = el.format;
                span = el.span;
            }

            let value = JSONPath({ path: "$." + key, json: data })[0];

            if (type === "date") {
                value = moment(value).format(format);
            }
            if (el.render && !(typeof  el.render  === 'string' || el.render instanceof String)) {
                value = el.render(value, data);
            }
            if((typeof  el.render  === 'string' || el.render instanceof String)){
                value = eval(el.render)
            }
          
            return (
                <Descriptions.Item key={key} label={label || ""} contentStyle={style} span={span}>
                    {value || ""}
                </Descriptions.Item>
            );
        });
    };

    return (
        <Descriptions {...options} title={title}>
            {drawObject(pattern)}
        </Descriptions>
    );
};

export default DynamicDetail;
