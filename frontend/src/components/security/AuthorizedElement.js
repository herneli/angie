import AuthorizedFunction from "./AuthorizedFunction";

export default function AuthorizedElement({ roles, children }) {

    return AuthorizedFunction(roles) && children;
}