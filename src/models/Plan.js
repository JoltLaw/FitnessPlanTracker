const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");


// Setting up plan Schema 
const planSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    User: {  type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User", },
    Mo: [],
    Tu: [],
    We: [],
    Th: [],
    Fr: [],
    Sa: [],
    Su: [],
}, {
    timestamps: true,
})


const Plan = mongoose.model("plan", planSchema)

module.exports = Plan