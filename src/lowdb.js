const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class DatabaseManager {
    constructor(){
        const adapter = new FileSync('db.json');
        this.db = low(adapter);
        this.db.defaults({ sensorData: {}, lastSensorData: {}, count: 0 })
            .write();

        this.isEmpty = (obj) => {
            return !Object.keys(obj).length > 0;
        }
    }

    addSensorData(sensorId, data){
        return new Promise ((resolve, reject) => {
            console.log(sensorId);
            console.log(JSON.stringify(data, null, 2));
            try{
                const timestamp = Date.now();
                // // save to list
                // this.db.setWith(`sensorData.${sensorId}.${timestamp}`, data, Object)
                //     .write();
    
                // save to lastmodified
                this.db.set(`lastSensorData.${sensorId}`, {
                    timestamp,
                    ...data
                }).write();

                // increment dataCount
                this.db.update('count', n => n + 1).write();

                resolve('Success, new sensor data saved in DB');
            }catch(err){
                reject('Error, fail to save sensor data in DB');
            }
        });
    }

    getSensorLastData(sensorId){
        return new Promise ((resolve, reject) => {
            try{
                const data = this.db.get(`lastSensorData.${sensorId}`).value();
                if(!data || this.isEmpty(data)) reject('Data not found');
                resolve(data);
            }catch(err){
                console.error(err);
                reject('Error, fail to retrieve data sensor data from DB');
            }
        });
    }

    getAllLastSensorData(){
        return new Promise ((resolve, reject) => {
            try{
                const data = this.db.get(`lastSensorData`).value();
                if(!data || this.isEmpty(data)) reject('Data not found');
                resolve(data);
            }catch(err){
                reject('Error, fail to retrieve data sensor data from DB');
            }
        });
    }

    getSensorAllData(sensorId){
        return new Promise ((resolve, reject) => {
            try{
                const data = this.db.get(`sensorData.${sensorId}`).value();
                if(!data || this.isEmpty(data)) reject('Data not found');
                resolve(data);
            }catch(err){
                reject('Error, fail to retrieve data sensor data from DB');
            }
        });
    }

    getNbData(){
        return new Promise ((resolve, reject) => {
            try{
                const count = this.db.get(`count`).value();
                if(!count) reject('Data not found');
                resolve({count});
            }catch(err){
                reject('Error, fail to retrieve data sensor data from DB');
            }
        });
    }

    // getLastDataLaterThan(timestamp){
    //     return new Promise ((resolve, reject) => {
    //         try{
    //             const data = this.db.get(`lastSensorData`)
    //                 .findKey(o => {
    //                     return 
    //                 });
    //             resolve(data);
    //         }catch(err){
    //             reject('Error, fail to retrieve data sensor data from DB');
    //         }
    //     });
    // }

};

module.exports = DatabaseManager;
// Set some defaults (required if your JSON file is empty)


// // Add a post
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome'})
//   .write()

// // Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode')
//   .write()
  
// // Increment count
// db.update('count', n => n + 1)
//   .write()