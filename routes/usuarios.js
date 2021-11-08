const express = require("express")
const router = express.Router()
const usuarioController = require("../controllers/usuarioController")
const {check} = require("express-validator")

router.post("/",
    [
        check("nombre", "El nombre es obligatorio").not().isEmpty(), //revisa que el nombre no esté vacio
        check("email", "El email tiene que ser valido").isEmail(),
        check("password", "La contraseña tiene que tener un minimo de 6 caracteres").isLength({min: 6}),
    ],
    usuarioController.nuevoUsuario
)

module.exports = router;