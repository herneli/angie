exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("sections").del();



    // Inserts seed entries
    await knex("sections").insert([
        {
            "id": "add80922-0ba9-4658-b576-5ef8d20f527f",
            "document_type": "section",
            "code": 2,
            "data": {"id": "add80922-0ba9-4658-b576-5ef8d20f527f", "code": "2", "icon": "mdiSourceBranch", "roles": ["user", "admin"], "title": "Administracion", "value": "/admin"}
        },
        {
            "id": "51cacf54-eb49-4912-b856-c6a68b14dae1",
            "document_type": "menu",
            "code": "menu",
            "data":  JSON.stringify([{"id": "da381d5e-4dea-44af-bd17-634497d974ad", "code": "3", "icon": "mdiAccountGroup", "title": "element", "value": "/comunication"}, {"id": "5dd58d7c-ed73-4abc-86c9-48b989440cdb", "code": "1", "icon": "mdiSourceBranch", "roles": ["/default"], "title": "Dashboard", "value": "/dashboard", "childrens": [{"code": "uyr", "icon": "4", "title": "4", "value": "/4", "childrens": [{"code": "4", "icon": "4", "title": "4", "value": "/4"}]}]}, {"icon": "mdiSourceBranch", "title": "Administracion", "value": "/admin", "children": [{"icon": "mdiAccountGroup", "title": "Gestión", "value": "/admin/gestion", "children": [{"title": "administration.users", "value": "/admin/users"}, {"title": "administration.sections", "value": "/admin/sections"}, {"title": "administration.organization", "value": "/admin/organization"}]}, {"icon": "mdiConnection", "title": "Comunicaciones", "value": "/admin/comunicaciones", "children": [{"title": "administration.integration", "value": "/admin/integration"}, {"title": "administration.node_type", "value": "/admin/node_type"}, {"title": "administration.camel_component", "value": "/admin/camel_component"}]}, {"icon": "mdiPalette", "title": "Personalización", "value": "/admin/personalization", "children": [{"title": "administration.config_context", "value": "/admin/config_context"}, {"title": "administration.config_method", "value": "/admin/config_method"}, {"title": "administration.config_object", "value": "/admin/config_object"}]}]}])
        }

    ])

        
}