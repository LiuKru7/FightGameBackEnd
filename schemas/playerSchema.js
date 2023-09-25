const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    username: {
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type:String,
        required:true
    },
    money: {
        type: Number,
        required:true,
        default: 200
    }
})

const Player = mongoose.model("FightGamePlayers", playerSchema);
module.exports = Player; // Export the Player model


