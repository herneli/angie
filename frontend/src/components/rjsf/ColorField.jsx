/**
 * Utiliza el componente nativo del navegador como color picker.
 *
 * si recibe options.colors = ['#fff',...] definirá una lista de colores fijos
 *
 * si recine options.colors = [] la lista de colores se construirá automáticamente
 */
const ColorField = function ({ value, onChange, options }) {
    return (
        <span>
            <input
                type="color"
                value={value}
                onChange={({ target }) => onChange(target.value)}
                list={options.colors && "colors"}
            />
            {options.colors && (
                <datalist id="colors">
                    {options.colors.map((el, idx) => (
                        <option key={`color${idx}`} value={el} />
                    ))}
                </datalist>
            )}
        </span>
    );
};

export default ColorField;
