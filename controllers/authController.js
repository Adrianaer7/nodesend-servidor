const Usuario = require("../models/Usuario")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config.apply({path: "variable.env"})  //dotenv carga variables de entorno que hay en un archivo .env. El path es la ruta del archivo
const {validationResult} = require("express-validator") 

exports.autenticarUsuario  = async (req, res, next) => {

    //Mostrar mensajes de error
    const errores = validationResult(req)   
    if(!errores.isEmpty()) { 
        return res.status(400).json({errores: errores.array()}) 
    }

    //Buscar el usuario para ver si está registrado
    const {email, password} = req.body

    const usuario = await Usuario.findOne({email})  //comparo el email del usuario registrado en el email del usuario que quiero autenticarme
    if(!usuario) {  //si no hay email coincidente,
        res.status(401).json({msg: "El usuario no existe"})
    }

    //Verificar el password y autenticar el usuario
    if(bcrypt.compareSync(password, usuario.password)) {  //comparo la password que le estoy enviando con la password que ya está registrada en el usuario para saber si son iguales
        //Crear JWT
        const token = jwt.sign({
            id: usuario.id, //almacenamos en el jwt los datos que quiera. Genera el jwt con la info que yo le pase. En este caso, todos los datos del usuario. Cuanto mas datos le pase, mas pesará y mas tardará en generarlo
            nombre: usuario.nombre, 
            email: usuario.email
        }, process.env.SECRETA, {   //con una palabra secreta
            expiresIn: "30d" 
        })
        res.json({token})
    } else {
        res.status(401).json({msg: "La contraseña es incorrecta"})
    }
}

exports.usuarioAutenticado = (req, res) => {
   res.json({usuario: req.usuario}) //traigo del middleware los datos del token
}