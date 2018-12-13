const express = require('express');
const http = require('http');
// const fs = require('fs');
const path = require('path');
const twig = require('twig');
const _ = require('lodash');
// const fetch = require('node-fetch');

const DbManager = require('./lowdb');
const dbManager = new DbManager();
// const SerialManager = require('./serial');
// const serialManager = new SerialManager(dbManager);
// const UdpManager = require('./udp');
// const udpManager = new UdpManager(
//     // serialManager,
//     dbManager
// );


const validateMessage = (message) => {
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

    let result = {data:{}};
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


const SALT = 1567464;

const SerialPort = require('serialport');
const serialPort = new SerialPort('/dev/ttyUSB0', {
    bauDrate: 115200
});

// Switches the port into "flowing mode"
serialPort.on('data', function (data) {
    console.log('Data:', data);
});
// Read data that is available but keep the stream from entering //"flowing mode"
serialPort.on('readable', function () {
    console.log('Data:', serialPort.read());
});

// const SerialPort = require('serialport');
// const Readline = require('@serialport/parser-readline');
// const portS = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });
// const parser = portS.pipe(new Readline({ 
//     delimiter: '\n',
//     encoding: 'ascii'
// }));
// parser.on('data', (data)=> {
//     console.log(data);
//     res = validateMessage(data);
//     console.log(res);
//     // if(res){
//     //     dbManager.addSensorData(res['id'],res['data']);
//     // }
// });
// // The open event is always emitted
// portS.on('open', function() {
//   // open logic
//   console.log('open');
// })




const publicPath = path.join(__dirname, 'www');
const port = process.env.PORT || 80;

const app = express();
const server = http.createServer(app);

// Setup
app.use(express.static(path.join(__dirname, '../www')));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'twig');
    // DEV ONLY
    twig.cache(false); 
    app.set('view cache', false);
app.set('twig options', { 
    strict_variables: false
});

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
    
    const data = await dbManager.getAllLastSensorData();
    res.render('home/index.html.twig', {data});
});


/**
 * API : 
 * /get/sensor-data/1 => last data of sensor ID
 * /get/sensor-data/all => last data of ALL sensord
 * /get/sensor-data/1/all => ALL data of sensor ID
 * /get/data-count => ALL data COUNT
 */

app.get('/get/sensor-data/:id', async (req, res) => {
    const id = req.params.id || 'all';
    let data;
    try{
        if(id === 'all'){
            data = await dbManager.getAllLastSensorData();
        }else{
            data = await dbManager.getSensorLastData(id);
        }
        console.log("##### GET ######");
        console.log(JSON.stringify(data, null, 2));
        res.send(data);
    }catch(err){
        res.status(404).send();
    }
});

app.get('/get/sensor-data/:id/all', async (req, res) => {
    const id = req.params.id || 0;
    try{
        const data = await dbManager.getSensorAllData(id);
        console.log("##### GET ######");
        console.log(JSON.stringify(data, null, 2));
        res.send(data);
    }catch(err){
        res.status(404).send();
    }
});

app.get('/get/data-count', async (req, res) => {
    try{
        const data = await dbManager.getNbData();
        console.log("##### GET ######");
        console.log(JSON.stringify(data, null, 2));
        res.send(data);
    }catch(err){
        res.status(404).send();
    }
});
app.post('/test', (req, res) => {
    const message = req.body.message; console.log("message: "+message);
    const SALT = 2345600
    // SALT:ID:T=1234,I=2234,U=4567
    const fragments = message.split(':'); console.log("fragments: "+fragments);
    console.log("fragments.length: "+fragments.length);
    console.log("fragment[0]: "+fragments[0]);
    if(fragments.length !== 3
        || fragments[0] != SALT){
        res.status(404).send(); return;//|| !['T','L','H','U','I'].indexOf(fragments[2])
    }
    // if(fragments.length !== 3 
    //     || fragments[0] !== SALT
    // ){
    //     res.status(404).send(); return;//|| !['T','L','H','U','I'].indexOf(fragments[2])
    // } 

    const sensorId = fragments[1];
    console.log("sensorId: "+sensorId);
    const data = fragments[2].split(';');  console.log("data: "+data);
    if(data.length <= 0) {
        return res.status(404).send();
    }
    let newData = [];
    data.forEach(value => {
        const parts = value.split('=');  console.log("parts: "+parts);
        if(parts.length !== 2) {
            return res.status(404).send();
        }
        newData.push({ [parts[0]]: parts[1] });
    });
    console.log("newdata: "+newData);

    let result = {}
    newData.forEach(value => {
        switch (Object.keys(value)[0]) {
            case 'T':
                result['temperature'] = value['T'];
                break;
            case 'H':
                result['humidity'] = value['H'];
                break;
            case 'L':
                result['luminosity'] = value['L'];
                break;
            case 'I':
                result['ir'] = value['I'];
                break;
            case 'U':
                result['uv'] = value['U'];
                break;
            default:
                break;
        }
    });
    res.send(result);
});

app.post('/set/sensor-config/:id', (req, res) => {
    const id = req.params.id || 0;
    console.log(req.body);
    // var body = _.pick(req.body, ['temp', '1234']);
});

app.post('/set/sensor-data/:id', (req, res) => {
    const id = req.params.id || -1;
    const data = _.pick(req.body, [
        'temperature', 
        'humidity',
        'luminosity'
    ]);

    dbManager.addSensorData(id, data).then(() => {
        res.status(200).send();
    }).catch((err) => {
        console.error(err);
        res.status(403).send();
    });
});



// if(id < 0 || isEmpty(data)) res.status(403).send();
// const isEmpty = (obj) => {
//     return !Object.keys(obj).length > 0;
// }

// Start servers
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
