const Enlaces = require("../models/Enlace")
const {nanoid} = require("nanoid")  //nanoid reemplaza a shortid
const bcrypt = require("bcrypt")
const {validationResult} = require("express-validator")

exports.nuevoEnlace = async (req, res, next) => {

    //Revisar si hay errores
    const errores = validationResult(req)   
    if(!errores.isEmpty()) {  
        return res.status(400).json({errores: errores.array()}) 
    }

    //Crear un objeto de enlace
    const {nombre_original, nombre} = req.body

    const enlace = new Enlaces()
    enlace.url = nanoid(10) //le indico que cree un id de maximo 10 caracteres y lo ponga en el campo del objeto
    enlace.nombre = nombre  //traigo el nombre del archivo hasheado del appState, que lo trae de archivosController
    enlace.nombre_original = nombre_original

    //Si el usuario está autenticado
    if(req.usuario) { //me lo traigo del middleware
        const {descargas, password} = req.body

        //Asignar a enlace el numero de descargas
        if(descargas) {
            enlace.descargas = descargas
        }

        //Asignar un password
        if(password) {
            const salt = await bcrypt.genSalt(10)   //genera un hash
            enlace.password = await bcrypt.hash(password, salt) //hashea la password
        }

        //Asingar el autor
        enlace.autor = req.usuario.id
    }

    //Almacenar en la base de datos
    try {
        await enlace.save()
        res.json({url: `${enlace.url}`})
        next()
    } catch (error) {
        console.log(error)
    }
}

//Si tiene password el enlace
exports.tienePassword = async (req, res, next) => {
    const {url} = await req.params  //params porque le paso el dato por la barra de direcciones (o desde un axios.get o post). url porqué tiene que tener el mismo nombre que el parametro que paso en la ruta
    const enlace = await Enlaces.findOne({url}) //encuentra un enlace en la bd que coincida con el url que le paso
    //Si no existe el enlace
    if(!enlace) {
        res.status(404).json({msg: "El enlace no existe"})
        return next()
    }

    if(enlace.password) {
        return res.json({password: true, enlace: enlace.url, archivo: enlace.nombre})
    }
    next()  //si no tiene password lo mando al siguiente middleware
}

//Verifica si el password del archivo que ingresa el usuario es correcto
exports.verificarPassword = async (req, res, next) => {
    const {url} = req.params
    const {password} = req.body

    //Consultar por el enlace
    const enlace = await Enlaces.findOne({url})
    //Verificar el password
    if(bcrypt.compareSync(password, enlace.password)) {   //comparo la contraseña que el usuario escribe con la que hay en la bd
        //permitirle al usuario descargar el archivo
        next()

    } else {
        res.status(401).json({msg: "Contraseña del archivo incorrecta"})
    }
}

//Obtiene un listado de todos los enlaces
exports.todosEnlaces = async(req, res) => {
    try {   
        const enlaces = await Enlaces.find({}).select("url -_id")   //con el .find traigo todos los enlaces con sus campos de la bd. Con el .select selecciono lo que necesito, en este caso la url. -_id con esto quito el campo _id que me lo trae siempre aunque filtre solo por url
        res.json({enlaces})
    } catch (error) {
        console.log(error)
    }
}

//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
    const {url} = await req.params
    const enlace = await Enlaces.findOne({url}) 
    //Si no existe el enlace
    if(!enlace) {
        res.status(404).json({msg: "El enlace no existe"})
        return next()
    }
    
    //Si existe el enlace
    res.json({archivo: enlace.nombre, password: false})  //creo un json llamado archivo que contiene el nombre del archivo hasheado
    next()
}
