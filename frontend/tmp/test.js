//Variables

// Start

// Programa de test para la demo

// ¿Es usuario es Pedro?
if (
    eq(context?.objectCode, { params: { value: "context_test" } }) ||
    eq(context?.userName, { params: { value: "Pedro" } }) ||
    hasValue(context?.objectCode, { params: {} }) ||
    between(context?.number, { params: { to: 5, from: 3 } })
) {
    // Nuevo grupo de expresiones
    logInfo(context?.functions, { params: { message: "Mensaje super chulo" } });
    logInfo(context?.functions, { params: { message: "context" } });
} else {
    // Nuevo grupo de expresiones
    logInfo(context?.functions, {
        params: { message: "Algo ha ido mal espero que no vaya a peor!" },
    });

    // Nuevo blucle
    range(context?.functions, { params: { size: 5 } }).forEach((index) => {
        context.variables["index"] = index;

        // La variable "index" contiene la iteración actual
        // Nuevo grupo de expresiones
        logInfo(context?.functions, {
            params: { message: 'toString(context?.index, {"params":{}})' },
        });
    });
}

// End
