var util = require('util');

var async = require('async');

var SensorTag = require('./index');

var USE_READ = false;

var NOTIFY_PERIOD= 1000;

var NOTIFY_TIMEOUT= 1000*60*60;

var local_database={ambient: 0, counter: 0,temperature: 0,humidity: 0,pressure: 0,battvolt:0};

function test_sensortag(sensorTag) {
  console.log('discovered: ' + sensorTag);

  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    setTimeout(null,2000);
    SensorTag.discover(test_sensortag);
    // process.exit(0);
  });

  async.series([
      function(callback) {
        console.log('connectAndSetUp');
        sensorTag.connectAndSetUp(callback);
      },

      function(callback) {
        // console.log('readDeviceName');
        sensorTag.readDeviceName(function(error, deviceName) {
          console.log('\tdevice name = ' + deviceName);
        });
        sensorTag.readSystemId(function(error, systemId) {
          console.log('\tsystem id = ' + systemId);
        });
        sensorTag.readSerialNumber(function(error, serialNumber) {
          console.log('\tserial number = ' + serialNumber);
        });
        sensorTag.readFirmwareRevision(function(error, firmwareRevision) {
          console.log('\tfirmware revision = ' + firmwareRevision);
        });
        sensorTag.readHardwareRevision(function(error, hardwareRevision) {
          console.log('\thardware revision = ' + hardwareRevision);
        });
        sensorTag.readSoftwareRevision(function(error, softwareRevision) {
          //Leon found BUG (20150617)! readHardwareRevision>>>readSoftwareRevision
          console.log('\tsoftware revision = ' + softwareRevision);
        });
        sensorTag.readManufacturerName(function(error, manufacturerName) {
          console.log('\tmanufacturer name = ' + manufacturerName);
        });
        callback();
      },
      function(callback) {
          sensorTag.readBatteryLevel(function(error, batteryLevel) {
            console.log('battery level = ' + batteryLevel);
            callback();
        });
      },
      function(callback) {
        sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature) {
          local_database['ambient']=ambientTemperature.toFixed(1);
          local_database['counter']=objectTemperature.toFixed(1);
            console.log(','+JSON.stringify(local_database));
        });
        sensorTag.on('humidityChange', function(temperature, humidity) {
          local_database['temperature']=temperature.toFixed(1);
          local_database['humidity']=humidity.toFixed(1);
            console.log(','+JSON.stringify(local_database));
        });
        sensorTag.on('barometricPressureChange', function(pressure) {
            local_database['pressure']=pressure.toFixed(1);
            console.log(','+JSON.stringify(local_database));
          });
        sensorTag.on('batteryVoltageChange', function(voltagemv) {
            local_database['battvolt']=voltagemv.toFixed(1);
            console.log(','+JSON.stringify(local_database));
          });
          console.log('setIrTemperaturePeriod='+NOTIFY_PERIOD);
          sensorTag.setIrTemperaturePeriod(NOTIFY_PERIOD,null);
          console.log('setHumidityPeriod='+NOTIFY_PERIOD);
          sensorTag.setHumidityPeriod(NOTIFY_PERIOD,null);
          console.log('setBarometricPressurePeriod='+NOTIFY_PERIOD);
          sensorTag.setBarometricPressurePeriod(NOTIFY_PERIOD,null);
          console.log('setBatteryVoltagePeriod='+NOTIFY_PERIOD);
          sensorTag.setBatteryVoltagePeriod(NOTIFY_PERIOD,null);

          sensorTag.enableIrTemperature(null);
          sensorTag.enableHumidity(null);
          sensorTag.enableBarometricPressure(null);
          sensorTag.enableBatteryVoltage(null);

          async.parallel([
            function(callback) {
              console.log('notifyIrTemperature');
              sensorTag.notifyIrTemperature(function(error) {
                setTimeout(function() {
                  console.log('unnotifyIrTemperature');
                  sensorTag.unnotifyIrTemperature(callback);
                }, NOTIFY_TIMEOUT);
              });
            },
            function(callback) {
              console.log('notifyHumidity');
              sensorTag.notifyHumidity(function(error) {
                setTimeout(function() {
                  console.log('unnotifyHumidity');
                  sensorTag.unnotifyHumidity(callback);
                }, NOTIFY_TIMEOUT);
              });
            },
            function(callback) {
              console.log('notifyBarometricPressure');
              sensorTag.notifyBarometricPressure(function(error) {
                setTimeout(function() {
                  console.log('unnotifyBarometricPressure');
                  sensorTag.unnotifyBarometricPressure(callback);
                }, NOTIFY_TIMEOUT);
              });
            },
            function(callback) {
              console.log('notifyBatteryVoltage');
              sensorTag.notifyBatteryVoltage(function(error) {
                setTimeout(function() {
                  console.log('unnotifyBatteryVoltage');
                  sensorTag.unnotifyBatteryVoltage(callback);
                }, NOTIFY_TIMEOUT);
              });
            }
          ]);
      },
      function(callback) {
        console.log('disconnect');
        sensorTag.disconnect(callback);
        // console.log('readFirmwareRevision');
      }
      ]);
}

SensorTag.discover(test_sensortag);
