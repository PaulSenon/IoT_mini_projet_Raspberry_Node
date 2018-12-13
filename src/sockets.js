const socketIO = require('socket.io');

const io = socketIO(server);

io.on('connection', async (socket) => {
    console.log(`new user : ${socket.id}`);

    socket.emit('message', {
        "content": "hello world"
    });
});