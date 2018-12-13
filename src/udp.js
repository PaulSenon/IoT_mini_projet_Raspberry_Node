const dgram = require('dgram');
const UDP_PORT = 3000;

class UDPManager{
    constructor(/*serialManager, */dbManager){
        // this.serialManager = serialManager;
        this.dbManager = dbManager;
        const server = dgram.createSocket('udp4');
        this.server = server;
        this.server.bind(UDP_PORT);

        this.server.on('listening', () => {
            console.log('UDP Server started at ', UDP_PORT);
        });

        this.server.on('message', async (msg, remote) => {
            var message = msg.toString(); // need to convert to string 
            console.log(remote.address + ':' + remote.port +' - ' + message);
            if(message === 'getValues()'){
                const resObject = await this.dbManager.getSensorLastData(1); // TODO là c'est en dur
                const json = JSON.stringify(resObject);
                this.server.send(json, 0, json.length, remote.port, remote.address, function(err, bytes) {
                    if (err) throw err;
                    console.log('UDP message sent to ' + remote.port +':'+ remote.address);
                });
            }
            // await this.serialManager.sendMessage(message);
        });

        this.server.on('error', () => {
            // handle error
            console.error('Error in UDP');
        });
    }
};

module.exports = UDPManager;