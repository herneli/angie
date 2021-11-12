import { expect } from "chai";
import { IntegrationDao } from "../../app/server/api/integration";
import BaseDaoTest from "./BaseDaoTest";

describe("IntegrationDao", () => {
    BaseDaoTest(
        IntegrationDao,
        "52ccca4d-110a-46d2-929c-a65892b865a8",
        {
            name: "asdf",
            data: {},
            enabled: true,
        },
        {
            name: {
                type: "exact",
                value: "asdf",
            },
        }
    );
});
