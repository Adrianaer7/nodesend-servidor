const multer = require("multer")    //Permite subir archivos
const {nanoid} = require("nanoid")
const fs = require("fs")    //File System. Permite crear o eliminar nuevos archivos
const Enlaces = require("../models/Enlace")

exports.subirArchivo = (req, res, next) => {

    //Configurar el multer
    const configuracionMulter = {
        //Defino los limites del archivo
        limits: {fileSize: req.usuario ? 10485760 : 1048576},   //si el usuario está logeado, que permita descargar archivos de hasta 10 megas, sino, 1 mega
        //dónde se va a guardar el archivo
        storage: fileStorage = multer.diskStorage({ 
            destination: (req, file, cb) => {
                cb(null, __dirname+"/../uploads")   //cb es el callback, es para saber si hay errores. Si no hay errores queda como null
            },
            //que nombre y extension va a tener
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf("."), file.originalname.length)   //evita que al subir archivos con nombre.descripcion.jpeg, multer no sepa cual es la extension del archivo por la cantidad de puntos. Con esto, toma siempre el ultimo punto como referencia
                cb(null, `${nanoid(10)}${extension}`)    //multer le pone nombres muy grandes a los archivos que subo, para eso uso mejor nanoid y le añido la extension
            }
        })
    }

    const upload = multer(configuracionMulter).single("archivo")    //single es porque le paso 1 solo archivo. archivo porque elijo el nombre que le voy a pasar en el postman

    //Muestro el nombre del archivo que pasé
    upload(req, res, async (error) => { //importo error porque no es un trycatch        
        if(!error) {
            res.json({archivo: req.file.filename})  //muestra el nombre del archivo subido
        } else {
            console.log(error)
        }
    })
}

//Descarga un archivo
exports.descargar = async (req, res, next) => {
    //Obtiene el enlace
    const {archivo} = req.params    //traigo el nombre del archivo desde [enlace].js
    const enlace = await Enlaces.findOne({nombre: archivo})    //encuentra un enlace que tenga el mismo nombre del archivo que el que le paso por params
    if(!enlace) {
        res.status(401).json({msg: "descargas superadas"})    //si el enlace no existe (porque se eliminó al llegar al limite de descargas) redirecciono atras, osea al index
        return next()
    }
    const archivoDescarga = __dirname + "/../uploads/" + archivo
    res.download(archivoDescarga)

    //Eliminar el archivo y la entrada de la bd
    const {id, descargas, nombre} = enlace

    if(descargas === 1) {
        //Eliminar el archivo de la pc
        req.archivo = nombre    //Le paso el req.archivo a la funcion eliminarArchivo

        //Eliminar el enlace de la bd
        await Enlaces.findOneAndRemove(id)
        next()  //le dice al route que tiene que ejecutar la siguiente funcion del controlador, segun le haya especificado

    } else {
        //Si las descargas son > 1, restar 1
        enlace.descargas--  //resta de a 1
        await enlace.save() //guardo el enlace con la modificacion hecha
    }
}


//Eliminar el archivo
exports.eliminarArchivo = (req, res) => {
    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`) //El req.archivo viene del enlacesController. unlink es una funcion que permite eliminar un archivo del SO. __dirname me ubica en este mismo controlador
        console.log("Archivo eliminado")
    } catch (error) {
        console.log(error)
    }
}
