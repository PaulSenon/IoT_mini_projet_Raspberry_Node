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
// const udpManager = new UdpManager(serialManager);

//Setup Serial Port Connection
const SerialPort = require('serialport');
//const Readline = SerialPort.parsers.Readline;
const portSerial = new SerialPort('/dev/ttyUSB0',{
  baudRate: 9600,	
  // parser: new SerialPort.parsers.Readline('\r\n')
});
//const parser = new Readline();
//port.pipe(parser);
portSerial.on('data', sendDataToWebClient);
portSerial.on('error', function(err) {
    console.log('SearialPort Error: ', err.message);
});
//Send data from USB to web client
const sendDataToWebClient = (data) => {
  setTimeout(() => {
       data = data.toString();
       console.log('RECEIVED : ' + data);
    //    io.sockets.emit('news', { data: data });
     },1000
  )
};

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
    
    console.log('hello');
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
