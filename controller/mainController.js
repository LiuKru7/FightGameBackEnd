const playerDb = require("../schemas/playerSchema"); // Import the model
const bCrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const avatarsUrl = [
    {
    number: 0,
    url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
    used: false
},
    {
        number: 1,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 2,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 3,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 4,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 5,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 6,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 7,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 8,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
    {
        number: 9,
        url:'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-1/64/26-Wow-512.png',
        used: false
    },
]

module.exports = {
    avatars: (req,res) => {
        console.log("LALALA")
        res.send ({error: false, data: avatarsUrl, message:"work"})
    },

    register: async (req, res) => {
        const info = req.body;
        const player = new playerDb({
            username: info.username,
            password: info.password,
            avatar: avatarsUrl[info.avatar].url
        });
        const hash = await bCrypt.hash(player.password, 10);
        player.password = hash;
        console.log(player)

        player.save().then(() => {
            res.send({ error: false, data: [], message: "REGISTER" });
        }).catch(e => {
            res.send({ error: true, data: [], message: "FAULT" });
        });
    },

    login: async (req,res) => {
        const info = req.body
        const singleUser = await playerDb.findOne({ username: info.username});
        if (!singleUser) return

        const samePass= await bCrypt.compare (info.password, singleUser.password)
        if (samePass) {
            const token = jwt.sign(info, process.env.JWT_SECRET)
            res.send({error:false, data: token, message: "login successful"})
        } else {
            res.send({ error: true, data: [], message: "Login failed. Bad username or password." });
        }
    }
}