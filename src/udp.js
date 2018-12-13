const dgram = require('dgram');
const UDP_PORT = 3000;

class UDPManager{
    constructor(serialManager){
        this.serialManager = serialManager;
        this.server = dgram.createSocket('udp4');
        this.server.bind(UDP_PORT);

        this.server.on('listening', () => {
            console.log('UDP Server started at ', UDP_PORT);
        });

        this.server.on('message', async (msg, info) => {
            var message = msg.toString(); // need to convert to string 
            await this.serialManager.sendMessage(message);
            // since message is received as buffer 
            // receive the message and do task
        });

        this.server.on('error', () => {
            // handle error
            console.error('Error in UDP');
        });
    }
};

module.exports = UDPManager;