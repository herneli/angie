import vm from "vm";

export const runCode = (code) => {
    let context = {
        contextTest: {
            objectCode: "context_test",
            userName: "hernaj34",
        },
        console: console,
    };
    vm.createContext(context);
    try {
        vm.runInContext(code, context, { displayErrors: true });
    } catch (error) {
        console.log("Error", error);
    }
};
