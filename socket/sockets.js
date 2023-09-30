const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");
const playerDb = require("../schemas/playerSchema");
const { getUserForSocket, login} = require('../controller/mainController');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
        },
    });
    let userData2 = [];
    let rooms = [];
    let userSockets = {};  // Ensure this is initialized

    io.on('connect', (socket) => {
        socket.on('token', async (val) => {
            const data = jwt.verify(val, process.env.JWT_SECRET);
            socket.userData = data;
            let singleUser = await playerDb.findOne({ _id: data._id }, { password: 0 });
            let singleUserNew = {
                username: singleUser.username,
                weapon: singleUser.weapon,
                armour: singleUser.armour,
                potion: singleUser.potion,
                avatar: singleUser.avatar,
                id: singleUser._id,
                socket: socket.id,
                turn: false,
                hp: 100,
            }
            userData2.push(singleUserNew);
            socket.userData = singleUserNew;  // <-- Important change here
            io.emit('login', userData2);
            socket.emit('login2', singleUserNew)
        });

        socket.on('disconnect', () => {
            userData2 = userData2.filter((user) => user.socket !== socket.id);
        });

        socket.on('send_fight_request', (targetUserId) => {
            const targetUser = userData2.find(user => user.socket === targetUserId);
            if (targetUser) {
                io.to(targetUser.socket).emit('fight_request', {
                    from: {
                        id: socket.userData._id,       // Database ID
                        socketId: socket.id,           // Socket ID
                        username: socket.userData.username
                    }
                });
                console.log("send")
            }
        });

        socket.on('accept_fight', (opponentId) => {
            const opponentSocket = io.sockets.sockets.get(opponentId);
            if (opponentSocket) {
                const roomId = `${socket.id}_${opponentSocket.id}`;
                socket.join(roomId);
                opponentSocket.join(roomId);

                rooms.push({
                    roomId: roomId,
                    player1: socket.userData,
                    player2: opponentSocket.userData,
                });

                // Notify the player who accepted the fight
                io.to(socket.id).emit('fight_accepted', {
                    opponent: opponentSocket.userData
                });

                // Notify the player who initiated the fight
                io.to(opponentSocket.id).emit('fight_accepted', {
                    opponent: socket.userData

                });
                io.to(roomId).emit('room_created', {
                    roomId: roomId,
                    player1: socket.userData,
                    player2: opponentSocket.userData
                });
            }
        });


        socket.on('hit', (roomId) => {
            console.log("HITTT")
            const room = rooms.find(r => r.roomId === roomId);
            console.log(room)

            if (!room) return;
            if (!room.player1.turn && !room.player2.turn) {
                const random= Math.round(Math.random())
                if (random===0) {
                    room.player1.turn = true
                } else {
                    room.player2.turn = true
                }
            }
            if (room.player1.turn) {
                let damage=room.player1.weapon[0].weaponPower
                let gold = room.player1.weapon[0].gold


                let defenceChance = room.player2.weapon[0].blockChance + room.player2.armour[0].blockChance
                let defenceRandom = Math.floor(Math.random()+100)

                let doubleChange = room.player1.weapon[0].doubleChance + room.player1.armour[0].doubleChance
                let doubleChangeRandom = Math.floor(Math.random()+100)

                let steelChance = room.player1.weapon[0].stealChance + room.player1.armour[0].stealChance
                let stealChangeRandom = Math.floor(Math.random()*100)

                if(steelChance>stealChangeRandom) {
                    room.player1.hp+=1
                    room.player2.hp-=1
                }
                if (doubleChange>doubleChangeRandom) damage*=2
                if (defenceChance>defenceRandom) {
                    damage=0
                    gold=0
                }
                room.player1.gold+=gold
                room.player2.hp-= damage
                room.player2.turn=true
                room.player1.turn=false

            } else {
                let damage=room.player2.weapon[0].weaponPower
                let gold = room.player2.weapon[0].gold


                let defenceChance = room.player1.weapon[0].blockChance + room.player1.armour[0].blockChance
                let defenceRandom = Math.floor(Math.random()+100)

                let doubleChange = room.player2.weapon[0].doubleChance + room.player2.armour[0].doubleChance
                let doubleChangeRandom = Math.floor(Math.random()+100)

                let steelChance = room.player2.weapon[0].stealChance + room.player2.armour[0].stealChance
                let stealChangeRandom = Math.floor(Math.random()*100)

                if(steelChance>stealChangeRandom) {
                    room.player2.hp+=1
                    room.player1.hp-=1
                }
                if (doubleChange>doubleChangeRandom) damage*=2
                if (defenceChance>defenceRandom) {
                    damage=0
                    gold=0
                }
                room.player2.gold+=gold
                room.player1.hp-= damage
                room.player1.turn=true
                room.player2.turn=false
            }
            if (room.player1.hp < 0) room.player1.hp = 0;
            if (room.player2.hp < 0) room.player2.hp = 0;

            io.to(roomId).emit('update_players', {
                player1: room.player1,
                player2: room.player2,
                roomId: roomId
            });
        });
        socket.on('decline_fight', (opponentId) => {
            const opponentSocketId = userData2.find(user => user.id === opponentId)?.socket;
            if (opponentSocketId) {
                io.to(opponentSocketId).emit('fight_declined', {
                    opponent: socket.userData.username
                });
            }
        });
    });
};











