const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
     
    const authHeader = req.get("Authorization") //en postman voy a la pestaña authorization, selecciono bearer token y pego el token cuando hago un auth
    if(authHeader) {
        //Obtener el token
        const token = authHeader.split(" ")[1]  //va a crear un espacio entre la palabra Bearer y el token, lo va a guardar en un arreglo, y mando la posicion donde se aloja el token

        //Comprobar el JWT
        try {
            const usuario = jwt.verify(token, process.env.SECRETA)  //verifica que el token sea valido y envia los datos del usuario que elegí almacenar al crear el token, junto con la fecha de expiracion del token a la variable
            req.usuario = usuario   //lo envio al authController. De esta manera express hace que se comuniquen de manera interna el controller con el middleware  para que el usuario no pueda manipular los datos
        } catch (error) {
            console.log("JWT no valido")    //por si alguien quiere inciar sesion con un token que ya venció o es incorrecto
            console.log(error)
        }
    }
    next()  //para que vaya al siguiente middleware
}