const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")//importamos el modulo jwtoken
const keys = require("./key/keys")//importamos  clave secreta

app.set('key', keys.key) // referenciamos
app.use(express.urlencoded({extended:false}))//no tener error de varibles no definidas
app.use(express.json())

app.get("/" ,( req ,res) =>{
    res.send("conectado")
})

app.listen(3001, () =>{
    console.log("conectado a 3001")
})

//ruta para login

app.post("/login", (req,res) =>{
    const {user , pass} = req.body
    // harcodeamos este valor simulando un usuario existente con estas credenciales
    if(user == "admin" && pass == "1234"){
        const payload = {
            check : true
        }
        //jwt.sign(payload, secretOrPrivateKey, [options, callback]) documentacion       
        const token = jwt.sign(payload , app.get("key"),{
            expiresIn: "7d"
        })
        res.json({
            message :"¡authenticacion exitosa",
            token : token
        })
    }else{
        res.json({
            message : "password y/o usuario incorrecto"
        })
    }
})

// creamos middleware contra peticiones no deseadas

const verificacion = express.Router()

// aca enviamos en token desde el front 
verificacion.use((req ,res , next ) =>{
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    //si no nos envian token
    if(!token){
        res.status(401).send({
            error: "no se envio ningun token"
        })
        return//teminar accion
    }
    //si nos envian token
    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length)//quitamos el "Bearer " del token
    }
    //verificamos que coincida el token
    if(token){
                //TOKEN     KEY   SI HUBO ERROR AL VERIFICAR O SI VERIFICO CERRECTO
        jwt.verify(token , app.get("key") , (error, decoded)=>{
            if(error){//si hubo error
                return res.json({
                    message : "el token es invalido"
                })
            }else{
                req.decoded = decoded
                next()// dejamos que continue con el siguiente middleware
            }
        })
    }
})


app.get("/info", verificacion ,( req ,res) =>{// si pasa la verificacion tendra acceso a lo demas, sino dara error
    res.send("acceso con token exitosa")
})