const playerDb = require("../schemas/playerSchema"); // Import the model
const bCrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const avatarsUrl = [
    {
        number: 0,
        url:'https://i.pinimg.com/originals/d7/ce/8e/d7ce8ee1eceefb654f65dac89557b9fb.png',
        used: false
},
    {
        number: 1,
        url:'https://upload.wikimedia.org/wikipedia/en/0/04/Kuririn.png',
        used: false
    },
    {
        number: 2,
        url:'https://www.giantbomb.com/a/uploads/scale_medium/15/155548/2415341-cellperfectv4.png',
        used: false
    },
    {
        number: 3,
        url:'https://qph.cf2.quoracdn.net/main-qimg-19640afa58c1aa4f9c5b028a9884469f',
        used: false
    },
    {
        number: 4,
        url:'https://qph.cf2.quoracdn.net/main-qimg-04a35f6f466b94eef80a7629ca639c39',
        used: false
    },
    {
        number: 5,
        url:'https://i.pinimg.com/originals/b2/fe/02/b2fe02e02c80bc3b267991c1d9d637c8.png',
        used: false
    },
    {
        number: 6,
        url:'https://static.wikia.nocookie.net/teamfourstar/images/6/6f/Mirai_trunks.png',
        used: false
    },
    {
        number: 7,
        url:'https://static.wikia.nocookie.net/dragonballfighterz/images/0/09/Master_Roshi_Artwork.png',
        used: false
    },
    {
        number: 8,
        url:'https://static.wikia.nocookie.net/heroes-unite/images/f/f7/Bulma_dragon_ball_z_by_orco05-d4yp1v7.png',
        used: false
    },
    {
        number: 9,
        url:'https://i.pinimg.com/originals/76/e8/e6/76e8e69511d1d3f84707f6edb2cb4363.png',
        used: false
    },
]
let userForSocket = []
let lastGenerate = ""
module.exports = {
    avatars: async (req,res) => {
        res.send ({error: false, data: avatarsUrl, message:"work"})
    },
    register: async (req, res) => {
        const info = req.body;
        if (!info.avatar && info.avatar!==0) return res.send({ error: true, data: [], message: "no avatar" });
        const singleUser = await playerDb.findOne({ username: info.username});
        if (singleUser) return res.send({ error: true, data: [], message: "username exist" });
        const avatar = await playerDb.findOne ({avatar: avatarsUrl[info.avatar].url})
        if (avatar) return res.send({ error: true, data: [], message: "avatar exist" });
        const player = new playerDb({
            username: info.username,
            password: info.password,
            avatar: avatarsUrl[info.avatar].url,
            weapon: [{
                name:"weapon",
                color:"white",
                weaponUrl: "https://cdn-icons-png.flaticon.com/512/2491/2491229.png",
                weaponPower: 1,
                weaponLevel:1,
                gold: 1,
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }],
            armour: [{
                name:"armour",
                armourDefence: 0,
                armourLevel: 1,
                armourUrl: "https://cdn-icons-png.flaticon.com/512/391/391076.png",
                weaponPower: 1,
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }],
            potion: [{
                name: "potion",
                potion:1,
                potionUrl:"https://cdn-icons-png.flaticon.com/512/1391/1391333.png"
            }]
        });
        const hash = await bCrypt.hash(player.password, 10);
        player.password = hash;

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
            const newUser = {
                username: singleUser.username,
                _id: singleUser._id
            }
            userForSocket= newUser
            const token = jwt.sign(newUser, process.env.JWT_SECRET)
            res.send({error:false, data: token, message: "login successful"})
        } else {
            res.send({ error: true, data: [], message: "Login failed. Bad username or password." });
        }
    },
    gameInfoLoad: async (req,res) => {
        const info = req.params
        res.send({error:false, data: [], message: ""})
    },
    generateGame:async (req,res) => {

        const single = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if(single.money<50) return res.send({error:true, data: [], message:"enough money"})
        single.money -= 50

        const userNew = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            {
                $set: {
                    money: single.money
                }
            },
            { new: true, projection: { password: 0 } }
        );


        const weapons = [
            "https://cdn-icons-png.flaticon.com/512/771/771255.png",
            "https://cdn-icons-png.flaticon.com/256/771/771204.png",
            "https://cdn-icons-png.flaticon.com/512/297/297837.png",
            "https://cdn-icons-png.flaticon.com/512/5880/5880401.png",
            "https://cdn-icons-png.flaticon.com/512/123/123680.png",
            "https://cdn-icons-png.flaticon.com/512/1373/1373350.png",
            "https://cdn-icons-png.flaticon.com/512/1881/1881456.png",
            "https://cdn-icons-png.flaticon.com/512/827/827295.png",
            "https://cdn-icons-png.flaticon.com/512/1106/1106231.png",
            "https://cdn-icons-png.flaticon.com/512/2614/2614166.png",
            "https://cdn-icons-png.flaticon.com/512/2858/2858938.png",
            "https://cdn-icons-png.flaticon.com/512/6102/6102761.png",
        ]
        const armours = [
            "https://cdn1.iconfinder.com/data/icons/video-game-elements-4/32/Armor-512.png",
            "https://cdn-icons-png.flaticon.com/512/6169/6169387.png",
            "https://cdn-icons-png.flaticon.com/512/683/683550.png",
            "https://cdn-icons-png.flaticon.com/512/1907/1907813.png",
            "https://cdn-icons-png.flaticon.com/512/4243/4243175.png",
            "https://cdn-icons-png.flaticon.com/512/1907/1907813.png",
            "https://cdn3.iconfinder.com/data/icons/medieval-2d-rpg-game-items-weapons-armour-helmets-/26/GAME-SVG_--19-512.png",
            "https://cdn-icons-png.flaticon.com/512/6981/6981295.png",
            "https://cdn-icons-png.flaticon.com/512/1455/1455020.png",
            "https://cdn-icons-png.flaticon.com/512/9480/9480468.png",
            "https://cdn-icons-png.flaticon.com/512/6169/6169914.png",
            "https://cdn3.iconfinder.com/data/icons/medieval-2d-rpg-game-items-weapons-armour-helmets-/26/GAME-SVG_--18-512.png",
        ]
        const effectSlots = [
            { slotName: 'criticalChance',
                doubleChance: 50,
                blockChance: 0,
                stealChance: 0,
            },
            {
                slotName: 'dodgeChance',
                doubleChance: 0,
                blockChance: 40,
                stealChance: 0,
            },
            {
                slotName: 'criticalChance',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 50,
            }
        ]
        let items = {}
        let randomWeapon = Math.floor(Math.random()*12)
        let randomArmour = Math.floor(Math.random()*12)
        let randomPotion = Math.floor(Math.random()*100)+1
        let weaponLevel = 1
        let armourLevel = 1
        let weaponPower = 0
        let armourPower= 0
        let weaponEffectSlots= 0
        let weaponsSlots =  []
        let armourEffectSlots = 0
        let weaponEffects  = []
        let armourEffects = []
        let armourSlots=[]
        let goldGeneration = 0
        if (randomWeapon) {
            if(randomWeapon>7) {
                weaponEffectSlots = (Math.round(Math.random()))+ (Math.round(Math.random()))+(Math.round(Math.random()))
                weaponLevel = 3
                weaponPower=Math.floor(Math.random()*23)+7
                goldGeneration = (Math.floor(Math.random()*10)+1)
            }
            if(randomWeapon>3 && randomWeapon<8){
                weaponLevel = 2
                weaponEffectSlots = (Math.round(Math.random()))
                weaponPower=Math.floor(Math.random()*16)+4
                goldGeneration = (Math.floor(Math.random()*6)+1)
            }
            if(randomWeapon<4)
                weaponPower=Math.floor(Math.random()*5)+1
                goldGeneration = (Math.floor(Math.random()*3)+1)
        }
        if (randomArmour) {
            if (randomArmour > 7) {
                armourLevel = 3
                armourEffectSlots = (Math.round(Math.random())) + (Math.round(Math.random())) + (Math.round(Math.random()))
                armourPower = Math.floor(Math.random() * 90)
            }
            if (randomArmour > 3 && randomArmour < 8) {
                armourLevel = 2
                armourEffectSlots = (Math.round(Math.random()))
                armourPower = Math.floor(Math.random() * 50)
            }
            if (randomArmour < 4) armourPower = Math.floor(Math.random() * 20)

        }


        if (weaponEffectSlots) {
            if (weaponEffectSlots=== 1) {
                let randomSlot = Math.floor(Math.random()*3)
                weaponsSlots.push(randomSlot)
            }
            if (weaponEffectSlots===2) {
                let randomSlot = Math.floor(Math.random()*3)
                let randomSlot2 = 0
                let random = Math.floor(Math.random()*2)
                if (randomSlot===0) {
                    if (random===0) randomSlot2=1
                    else { randomSlot2=2}
                }
                if(randomSlot===1) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=2}
                }
                if(randomSlot===2) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=1}
                }
                weaponsSlots.push(randomSlot)
                weaponsSlots.push(randomSlot2)
            }
            if (weaponEffectSlots===3) {
                weaponsSlots = [1,2,3]
            }}

        if (armourEffectSlots) {

            if (armourEffectSlots=== 1) {
                let randomSlot = Math.floor(Math.random()*3)
                armourSlots.push(randomSlot)
            }
            if (armourEffectSlots===2) {
                let randomSlot = Math.floor(Math.random()*3)
                let randomSlot2 = 0
                let random = Math.floor(Math.random()*2)
                if (randomSlot===0) {
                    if (random===0) randomSlot2=1
                    else { randomSlot2=2}
                }
                if(randomSlot===1) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=2}
                }
                if(randomSlot===2) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=1}
                }
                armourSlots.push(randomSlot)
                armourSlots.push(randomSlot2)
            }
            if (armourEffectSlots===3) {
                armourSlots = [1,2,3]
            }}
        for (let i = 0; i < weaponsSlots.length ; i++) {
            if (weaponsSlots[i]===1) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'criticalChance',
                    doubleChance: random,
                    blockChance: 0,
                    stealChance: 0,
                }
                weaponEffects.push(slot)
            }
            if (weaponsSlots[i]===2) {
                let random = Math.floor(Math.random()*40)+1
                let slot = {
                    slotName: 'dodgeChance',
                    doubleChance: 0,
                    blockChance: random,
                    stealChance: 0,
                }
                weaponEffects.push(slot)
            }
            if (weaponsSlots[i]===3) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'stealChance',
                    doubleChance: 0,
                    blockChance: 0,
                    stealChance: random,
                }
                weaponEffects.push(slot)
            }
        }

        for (let i = 0; i < armourSlots.length ; i++) {
            if (armourSlots[i]===1) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'criticalChance',
                    doubleChance: random,
                    blockChance: 0,
                    stealChance: 0,
                }
                armourEffects.push(slot)
            }
            if (armourSlots[i]===2) {
                let random = Math.floor(Math.random()*40)+1
                let slot = {
                    slotName: 'dodgeChance',
                    doubleChance: 0,
                    blockChance: random,
                    stealChance: 0,
                }
                armourEffects.push(slot)
            }
            if (armourSlots[i]===3) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'stealChance',
                    doubleChance: 0,
                    blockChance: 0,
                    stealChance: random,
                }
                armourEffects.push(slot)
            }
        }

        if (weaponEffects.length===0) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
            weaponEffects.push(slot)
            weaponEffects.push(slot)
        }
        if (weaponEffects.length===1) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
            weaponEffects.push(slot)

        }
        if (weaponEffects.length===2) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
        }
        if (armourEffects.length===0) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
            armourEffects.push(slot)
            armourEffects.push(slot)
        }
        if (armourEffects.length===1) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
            armourEffects.push(slot)

        }
        if (armourEffects.length===2) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
        }
        let color = {
            weapon: "",
            armour: ""
        }

        if (weaponLevel===1) color.weapon="#fdfdbc"
        if (weaponLevel===2) color.weapon="#7a88a8"
        if (weaponLevel===3) color.weapon="#f88c8c"
        if (armourLevel===1) color.armour="#fdfdbc"
        if (armourLevel===2) color.armour="#7a88a8"
        if (armourLevel===3) color.armour="#f88c8c"

        items = {
            weapon: {
                gold: goldGeneration,
                color: color.weapon,
                name: "weapon",
                weaponUrl: weapons[randomWeapon],
                weaponPower: weaponPower,
                weaponLevel: weaponLevel,
                doubleChance: weaponEffects[0].doubleChance+weaponEffects[1].doubleChance+weaponEffects[2].doubleChance,
                blockChance: weaponEffects[0].blockChance+weaponEffects[1].blockChance+weaponEffects[2].blockChance,
                stealChance: weaponEffects[0].stealChance+weaponEffects[1].stealChance+weaponEffects[2].stealChance,
            },
            armour: {
                color: color.armour,
                name: "armour",
                armourUrl: armours[randomArmour],
                armourDefence: armourPower,
                armourLevel: armourLevel,
                doubleChance: armourEffects[0].doubleChance+armourEffects[1].doubleChance+armourEffects[2].doubleChance,
                blockChance: armourEffects[0].blockChance+armourEffects[1].blockChance+armourEffects[2].blockChance,
                stealChance: armourEffects[0].stealChance+armourEffects[1].stealChance+armourEffects[2].stealChance,
            },
            potion: {
                name: "potion",
                potion: randomPotion,
                potionUrl: "https://i.redd.it/cfc2ey1jz7141.png"
            }
        }
        lastGenerate= items

        res.send({error:false, data: [items,userNew], message: "login successful"})
    },
    takeItems:async (req,res) => {
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if (singleUser.items.length>7) return res.send({error:true, data: [], message: "FULL ITEMS"})
        let itemsNew = singleUser.items
        const data = req.params
        const takeItem = lastGenerate[data.id];
        itemsNew.push(takeItem)
        const user = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { items: itemsNew } },
            { new: true, projection: { password: 0 } }
        );

        res.send({error:false, data: user, message: "new Items"})
    },
    updateItems: async (req,res) => {
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if (!singleUser) res.send({error:true, data: user, message: "no user"})

        res.send({error:false, data: singleUser, message: "user"})
    },

    updateFightItem: async (req,res) => {
        const info = req.body
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        const filteredItems = singleUser.items.filter(item => item && item.name);



        const userNew = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            {
                $set: {
                    items: filteredItems
                }
            },
            { new: true, projection: { password: 0 } }
        );

        let itemToItems = []
        let index = info.index
        if (info.name === "weapon") {
            itemToItems = userNew.weapon
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { weapon: userNew.items[index],
                    items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})

        }
        if (info.name === "armour") {
            itemToItems = userNew.armour
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { armour: userNew.items[index],
                        items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})

        }
        if (info.name === "potion") {
            itemToItems= userNew.potion
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { potion: userNew.items[index],
                        items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})
        }
    },
    autoLogin: (req, res) => {
        const userInfos = req.user;
        userForSocket = userInfos;
        res.send({ error: false, data: userInfos, message: "user" });
    },
    removeItem: async (req,res) => {
        const info = req.body;
        try {
            await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $unset: { [`items.${info.index}`]: 1 } }
            );
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $pull: { items: null } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: ""})
        } catch(err) {
            res.send({error:true, data:[], message: "cant delete"})
        }
    },

    winGame: async (req, res) => {
        try {
            const info = req.body;
            if (info.winPotion) {
                const potion = await playerDb.findOneAndUpdate(
                    { username: info.username },
                    { $set: { potion: [] }},
                    { new: true, projection: { password: 0 } }
                )

            }
            if (info.losePotion) {
                const potion2 = await playerDb.findOneAndUpdate(
                    { username: info.lose },
                    { $set: { potion: [] }},
                    { new: true, projection: { password: 0 } }
                )
            }
            const user = await playerDb.findOneAndUpdate(
                { username: info.username },
                { $inc: { money: info.gold }},
                { new: true, projection: { password: 0 } }
        )
            if (!user) {
                return res.status(404).send({ error: true,data:[], message: 'User not found' });
            }
            res.send({ error: false, data: user, message: "" });
        } catch (error) {
            console.error('Error updating user money:', error);
            res.status(500).send({ error: true,data:[], message: 'Internal server error' });
        }
    }
}
