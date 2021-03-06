const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const portS = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });
const parser = portS.pipe(new Readline({ 
    delimiter: '\n',
    encoding: 'ascii'
}));
parser.on('data', (data)=> {
    
});
// The open event is always emitted
portS.on('open', function() {
  // open logic
  console.log('open');
})

const SALT = 1567464;
class SerialManager {
    constructor(dbManager){
        // Read data that is available but keep the stream in "paused mode"

        // this.port.on('data', (data) => {
        //     console.log('Data:', data);
        // });

        // this.port.on('open', async () => {
        //     console.log('LOL');
        //     await this.sendMessage('###################');
        // });
      
        this.validateMessage = (message) => {
            const fragments = message.split(':'); 
            if(fragments.length !== 3
                || fragments[0] != SALT) return false;

            const sensorId = fragments[1];
            const data = fragments[2].split(',');
            if(data.length <= 0) {
                return false;
            }

            let newData = [];
            data.forEach(value => {
                const parts = value.split('=');
                if(parts.length !== 2) return false;
                newData.push({ [parts[0]]: parts[1] });
            });

            let result = {}
            newData.forEach(value => {
                switch (Object.keys(value)[0]) {
                    case 'T':
                        result['data']['temperature'] = value['T'];
                        break;
                    case 'H':
                        result['data']['humidity'] = value['H'];
                        break;
                    case 'P':
                        result['data']['pressure'] = value['P'];
                        break;
                    case 'L':
                        result['data']['luminosity'] = value['L'];
                        break;
                    case 'I':
                        result['data']['ir'] = value['I'];
                        break;
                    case 'U':
                        result['data']['uv'] = value['U'];
                        break;
                    default:
                        break;
                }
            });
            result['id'] = sensorId;

            return result;
        };

        // // Error handler
        // this.port.on('error', function(err) {
        //     console.log('Error serial: ', err.message);
        // })
    }

    sendMessage(message){
        return new Promise((resolve, reject) => {
            this.port.write(`${SALT}:${message}`, err => {
                if (err) reject('Error on write: ', err.message)
                resolve('message sent');
            });
        });
    }

    askForRefresh(){
        return this.sendMessage('getValues()');
    }

    setUpdateRate(rate){
        return this.sendMessage(`setUpdateRate(${+rate})`);
    }

}

module.exports = SerialManager;

  
// // Switches the port into "flowing mode"
// port.on('data', function (data) {
//     console.log('Data:', data);
// });


