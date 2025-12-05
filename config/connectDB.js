const mongoose = require("mongoose")
require("dotenv").config();

console.log(process.env.DATABASE_URL)

exports.dbConnection = () =>{
    mongoose.connect(process.env.DATABASE_URL)
     .then(() => console.log('MongoDB connected...'))
     .catch(err => console.log(err,"error occured in db connection"));
}