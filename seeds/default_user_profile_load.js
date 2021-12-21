exports.seed = async function (knex) {

    await knex("profile").del();

    //Inserta el perfil admin
    await knex("profile").insert([
        {
            "id": "cebd44fa-5972-46b1-bc4d-76dec806ade2",
            "document_type": "object",
            "code": "profile_config",
            "data": {"name": "Administrador", "sections": ["/admin", "/"]}
        }
    ])

    //Proporciona el perfil al usuario 'admin'
    await knex("users").update({
        data: knex.raw(`jsonb_set(data, '{profile}','"cebd44fa-5972-46b1-bc4d-76dec806ade2"')`)
      }).where({"code": 'admin'})

    


}