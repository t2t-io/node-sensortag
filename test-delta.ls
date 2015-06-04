#!/usr/bin/env lsc

SensorTag = require './index'

SensorTag.discoverAll (sensortag) ->
  console.log "found sensortag (#{sensortag.uuid}, type: #{sensortag.type})"
  return false unless sensortag.type == "nrf51822"

  sensortag.on 'humidityChange', (temperature, humidity) ->
    return console.log "temperature: #{temperature}, humidity: #{humidity}"

  sensortag.on \disconnect, ->
    return console.log "disconnected"

  sensortag.connectAndSetUp (e0) ->
    return console.error "failed to connect and setup", e0 if e0?
    console.log "successfull to connect and setup"
    sensortag.readSerialNumber (ex, serialNumber) ->
      return console.error "failed to read serial number", ex if ex?
      return console.log "serial number: #{serialNumber}"

    sensortag.readDeviceName (e1, deviceName) ->
      return console.error "failed to read device name", e1 if e1?
      console.log "device name: #{deviceName}"
      sensortag.enableHumidity (e2) ->
        return console.error "failed to enable humidity sensor", e2 if e2?
        sensortag.setHumidityPeriod 20, (e3) ->
          return console.error "failed to set humidity notification period", e3 if e3?
          return sensortag.notifyHumidity (e4) ->
            return console.error "failed to enable humidity notification", e4 if e4?
            return console.log "successful to enable humidity notification"

