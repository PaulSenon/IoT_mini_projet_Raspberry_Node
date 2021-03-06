const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
const SALT = 1567464;

class SerialManager {
    constructor(dbManager){
        this.dbManager = dbManager;
        
        this.serial;
        raspi.init(() => {
            this.serial = new Serial();
            this.serial.open(() => {
                this.serial.on('data', (data) => {
                    console.log('SERIAL : '+data)
                });
                this.serial.write('Hello from raspi-serial');
            });
        });
    }
};

module.exports = SerialManager;

  
// // Switches the port into "flowing mode"
// port.on('data', function (data) {
//     console.log('Data:', data);
// });


