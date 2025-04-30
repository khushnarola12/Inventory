const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const productRoute = require("./routes/productRoute")
const contactRoute = require("./routes/contactRoute")
const errorHandler = require('./MiddleWare/errorMiddleware');
const cookieParser = require("cookie-parser")
const path = require("path");


const app =express();

//Middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json())
app.use(cors())

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

//Routes middleware
app.use('/api/users',userRoute)
app.use('/api/products',productRoute)
app.use('/api/contactus',contactRoute)

//Routes
app.get('/',(req,res)=>{
    res.send("Home page")
})

//Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//connect to MongoDB
mongoose
    .connect('mongodb://localhost:27017/inventory')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT,()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

    