const SerialPort = require('serialport');
SerialPort.parsers = {
    Readline: require('@serialport/parser-readline'),
};
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/ttyUSB0');
const parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// // Creating the parser and piping can be shortened to
// const parser = port.pipe(new Readline())

const SALT = 1567464;

class SerialManager {
    constructor(dbManager){
        this.dbManager = dbManager;
        // config serial port
        // this.port = new SerialPort('/dev/ttyUSB0', {
        //     baudRate: 9600
        // });

        
        // ROBOT ONLINE


        
        // Read data that is available but keep the stream in "paused mode"
        // this.port.on('readable', async () => {
        //     const message = this.port.read();
        //     console.log(message);

        //     // const res = this.validateMessage(message);
        //     // if(!res) return;
            
        //     // await this.dbManager.addSensorData(res['id'], res['data']);
        // });

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


