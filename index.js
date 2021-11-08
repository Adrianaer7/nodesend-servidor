const express = require("express")
const conectarDB = require("./config/db")
const cors = require("cors")

//Crear el servidor
const app = express()

//Conectar a la DB
conectarDB()    //ejecuto la funcion que está en db.js

//Habilitar Cors
const opcionesCors = {
    origin: process.env.FRONTEND_URL    //De esta manera solo va a aceptar peticiones de esta url
}
app.use(cors(opcionesCors)) 

//Puerto de la app. Cuando haga el deployment en Heroku se espera que la variable de entorno se llame PORT
const port = process.env.PORT || 4000   //Si existe process.env.PORT, entonces se asigna el puerto, sino, se asigna puerto 4000. Puede ser cualquier numero menos el puerto del cliente que es 3000

//Habilitar leer los valores de un body
app.use(express.json())

//Habilitar carpeta pública. De esta manera puedo acceder a los archivos que hay en la carpeta uploads poniendo el nombre del archivo en la url. Lo hago en [enlace].js
app.use(express.static("uploads"))

//Rutas de la app
app.use("/api/usuarios", require("./routes/usuarios"))  //el nombre de la api tiene que ser el mismo de cada coleccion en MongoDB
app.use("/api/auth", require("./routes/auth"))
app.use("/api/enlaces", require("./routes/enlaces"))
app.use("/api/archivos", require("./routes/archivos"))

//Arrancar la app
app.listen(port, "0.0.0.0", () => { //al puerto y al dominio lo va a asignar Heroku
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})

