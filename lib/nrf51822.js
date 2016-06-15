var NobleDevice = require('noble-device');

var Common = require('./common');

var ACCELEROMETER_UUID                      = 'f000aa1004514000b000000000000000';
var MAGNETOMETER_UUID                       = 'f000aa3004514000b000000000000000';
var GYROSCOPE_UUID                          = 'f000aa5004514000b000000000000000';
var BAROMETRIC_PRESSURE_UUID                = 'f000aa4004514000b000000000000000';
var TEST_UUID                               = 'f000aa6004514000b000000000000000';
var OAD_UUID                                = 'f000ffc004514000b000000000000000';

var ACCELEROMETER_CONFIG_UUID               = 'f000aa1204514000b000000000000000';
var ACCELEROMETER_DATA_UUID                 = 'f000aa1104514000b000000000000000';
var ACCELEROMETER_PERIOD_UUID               = 'f000aa1304514000b000000000000000';

var MAGNETOMETER_CONFIG_UUID                = 'f000aa3204514000b000000000000000';
var MAGNETOMETER_DATA_UUID                  = 'f000aa3104514000b000000000000000';
var MAGNETOMETER_PERIOD_UUID                = 'f000aa3304514000b000000000000000';

var BAROMETRIC_PRESSURE_CONFIG_UUID         = 'f000aa4204514000b000000000000000';
var BAROMETRIC_PRESSURE_CALIBRATION_UUID    = 'f000aa4304514000b000000000000000';

var GYROSCOPE_CONFIG_UUID                   = 'f000aa5204514000b000000000000000';
var GYROSCOPE_DATA_UUID                     = 'f000aa5104514000b000000000000000';
var GYROSCOPE_PERIOD_UUID                   = 'f000aa5304514000b000000000000000';

var TEST_DATA_UUID                          = 'f000aa6104514000b000000000000000';
var TEST_CONFIGURATION_UUID                 = 'f000aa6204514000b000000000000000';

var temp_offset=140.0;
var humidity_offset=100.0;

var NRF51822SensorTag = function(peripheral) {
  var localName;
    
  NobleDevice.call(this, peripheral);
  Common.call(this);
  
  //Add new Type for new version Beacon, Modify by Leon@20160616
  localName = peripheral.advertisement.localName;
  if((localName!=undefined)&&(localName.indexOf("DHTSB")>=0)) 
    this.type = 'nrf51822_v2';
  else
    this.type = 'nrf51822';
  

//Disable unnessery call By Leon@20150617
/*
  this.onAccelerometerChangeBinded      = this.onAccelerometerChange.bind(this);
  this.onMagnetometerChangeBinded       = this.onMagnetometerChange.bind(this);
  this.onGyroscopeChangeBinded          = this.onGyroscopeChange.bind(this);
*/
};

NRF51822SensorTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;
// Modify by Leon@20150508: Lock to Nordic Beacon Name
// Modify by Leon@20150508: Lock to New Nordic Beacon Name(DHTSB.MAC)
  return (localName === 'SensorBeacon') || (localName.indexOf("DHTSB")>=0) ||
          (localName === 'NordicSensorBeacon');
};

NobleDevice.Util.inherits(NRF51822SensorTag, NobleDevice);
NobleDevice.Util.mixin(NRF51822SensorTag, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(NRF51822SensorTag, NobleDevice.BatteryService);
NobleDevice.Util.mixin(NRF51822SensorTag, Common);

NRF51822SensorTag.prototype.convertIrTemperatureData = function(data, callback) {
  var ambientTemperature = data.readInt16LE(0) / temp_offset;
  var objectTemperature = data.readInt16LE(2); //Hiddern counter
  callback(objectTemperature, ambientTemperature);
};

NRF51822SensorTag.prototype.convertHumidityData = function(data, callback) {
  var temperature = data.readUInt16LE(0)/temp_offset;
  var humidity =(data.readUInt16LE(2))/humidity_offset;

  callback(temperature, humidity);
};

NRF51822SensorTag.prototype.enableBarometricPressure = function(callback) {
//Modify by Leon@20150617: No need calibration manually
  // this.writeUInt8Characteristic(BAROMETRIC_PRESSURE_UUID, BAROMETRIC_PRESSURE_CONFIG_UUID, 0x02, function(error) {
  //   if (error) {
  //     return callback(error);
  //   }

    // this.readDataCharacteristic(BAROMETRIC_PRESSURE_UUID, BAROMETRIC_PRESSURE_CALIBRATION_UUID, function(error, data) {
    //   if (error) {
    //     return callback(error);
    //   }

      // this._barometricPressureCalibrationData = data;

//Modify by Leon@20150617: No need calibration manually
      this.enableConfigCharacteristic(BAROMETRIC_PRESSURE_UUID, BAROMETRIC_PRESSURE_CONFIG_UUID, callback);
  //   }.bind(this));
  // }.bind(this));
};

NRF51822SensorTag.prototype.convertBarometricPressureData = function(data, callback) {
  pressure = data.readUInt32LE(0)/10000.0;
  temp = data.readUInt32LE(4)/1280.0;
  callback(pressure);
};

NRF51822SensorTag.prototype.convertBatteryVoltageData = function(data, callback) {
  voltagemv = data.readUInt16LE(0);
  callback(voltagemv);
};

// NRF51822SensorTag.prototype.enableAccelerometer = function(callback) {
//   this.enableConfigCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_CONFIG_UUID, callback);
// };

// NRF51822SensorTag.prototype.disableAccelerometer = function(callback) {
//   this.disableConfigCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_CONFIG_UUID, callback);
// };

// NRF51822SensorTag.prototype.readAccelerometer  = function(callback) {
//   this.readDataCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_DATA_UUID, function(error, data) {
//     if (error) {
//       return callback(error);
//     }

//     this.convertAccelerometerData(data, function(x, y, z) {
//       callback(null, x, y, z);
//     }.bind(this));
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.onAccelerometerChange = function(data) {
//   this.convertAccelerometerData(data, function(x, y, z) {
//     this.emit('accelerometerChange', x, y, z);
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.convertAccelerometerData = function(data, callback) {
//   var x = data.readInt8(0) / 16.0;
//   var y = data.readInt8(1) / 16.0;
//   var z = data.readInt8(2) / 16.0;

//   callback(x, y, z);
// };

// NRF51822SensorTag.prototype.notifyAccelerometer = function(callback) {
//   this.notifyCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_DATA_UUID, true, this.onAccelerometerChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.unnotifyAccelerometer = function(callback) {
//   this.notifyCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_DATA_UUID, false, this.onAccelerometerChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.setAccelerometerPeriod = function(period, callback) {
//   this.writePeriodCharacteristic(ACCELEROMETER_UUID, ACCELEROMETER_PERIOD_UUID, period, callback);
// };

// NRF51822SensorTag.prototype.enableMagnetometer = function(callback) {
//   this.enableConfigCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_CONFIG_UUID, callback);
// };

// NRF51822SensorTag.prototype.disableMagnetometer = function(callback) {
//   this.disableConfigCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_CONFIG_UUID, callback);
// };

// NRF51822SensorTag.prototype.readMagnetometer = function(callback) {
//   this.readDataCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_DATA_UUID, function(error, data) {
//     if (error) {
//       return callback(error);
//     }

//     this.convertMagnetometerData(data, function(x, y, z) {
//       callback(null, x, y, z);
//     }.bind(this));
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.onMagnetometerChange = function(data) {
//   this.convertMagnetometerData(data, function(x, y, z) {
//     this.emit('magnetometerChange', x, y, z);
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.convertMagnetometerData = function(data, callback) {
//   var x = data.readInt16LE(0) * 2000.0 / 65536.0;
//   var y = data.readInt16LE(2) * 2000.0 / 65536.0;
//   var z = data.readInt16LE(4) * 2000.0 / 65536.0;

//   callback(x, y, z);
// };

// NRF51822SensorTag.prototype.notifyMagnetometer = function(callback) {
//   this.notifyCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_DATA_UUID, true, this.onMagnetometerChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.unnotifyMagnetometer = function(callback) {
//   this.notifyCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_DATA_UUID, false, this.onMagnetometerChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.setMagnetometerPeriod = function(period, callback) {
//   this.writePeriodCharacteristic(MAGNETOMETER_UUID, MAGNETOMETER_PERIOD_UUID, period, callback);
// };

// NRF51822SensorTag.prototype.setGyroscopePeriod = function(period, callback) {
//   this.writePeriodCharacteristic(GYROSCOPE_UUID, GYROSCOPE_PERIOD_UUID, period, callback);
// };

// NRF51822SensorTag.prototype.enableGyroscope = function(callback) {
//   this.writeUInt8Characteristic(GYROSCOPE_UUID, GYROSCOPE_CONFIG_UUID, 0x07, callback);
// };

// NRF51822SensorTag.prototype.disableGyroscope = function(callback) {
//   this.disableConfigCharacteristic(GYROSCOPE_UUID, GYROSCOPE_CONFIG_UUID, callback);
// };

// NRF51822SensorTag.prototype.readGyroscope = function(callback) {
//   this.readDataCharacteristic(GYROSCOPE_UUID, GYROSCOPE_DATA_UUID, function(error, data) {
//     if (error) {
//       return callback(error);
//     }

//     this.convertGyroscopeData(data, function(x, y, z) {
//       callback(null, x, y, z);
//     }.bind(this));
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.onGyroscopeChange = function(data) {
//   this.convertGyroscopeData(data, function(x, y, z) {
//     this.emit('gyroscopeChange', x, y, z);
//   }.bind(this));
// };

// NRF51822SensorTag.prototype.convertGyroscopeData = function(data, callback) {
//   var x = data.readInt16LE(0) * (500.0 / 65536.0) * -1;
//   var y = data.readInt16LE(2) * (500.0 / 65536.0);
//   var z = data.readInt16LE(4) * (500.0 / 65536.0);

//   callback(x, y, z);
// };

// NRF51822SensorTag.prototype.notifyGyroscope = function(callback) {
//   this.notifyCharacteristic(GYROSCOPE_UUID, GYROSCOPE_DATA_UUID, true, this.onGyroscopeChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.unnotifyGyroscope = function(callback) {
//   this.notifyCharacteristic(GYROSCOPE_UUID, GYROSCOPE_DATA_UUID, false, this.onGyroscopeChangeBinded, callback);
// };

// NRF51822SensorTag.prototype.readTestData = function(callback) {
//   this.readUInt16LECharacteristic(TEST_UUID, TEST_DATA_UUID, callback);
// };

// NRF51822SensorTag.prototype.readTestConfiguration = function(callback) {
//   this.readUInt8Characteristic(TEST_UUID, TEST_CONFIGURATION_UUID, callback);
// };

module.exports = NRF51822SensorTag;
