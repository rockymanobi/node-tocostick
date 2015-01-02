var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var request = require("request");
var logger = require('./log.js');
var config = require('config');
module.exports  = (function(){

  /**
   *
   * events
   *   "ping-response" :
   *   "sync-status-response" :  body
   *   "start-monitoring-response" : 
   *   "stop-monitoring-response" : 
   *   "get-running-status-response" : 
   *
   */
  var HttpSyncer = function(){
  };

  util.inherits( HttpSyncer, EventEmitter );

  _.extend( HttpSyncer.prototype, {
    /**
     *
     */
    syncStatus: function( deviceInfo ,stall ){
      //TODO: implementation 
      logger.info( "update status of " + stall.id + " : " + stall.currentStatus );

      var _this = this;
      var options = {
        uri: config.urlRoot + '/sensor_api/v1/stalls/' + stall.id + '/sync_status',
        form: { _method: 'PUT', status: stall.currentStatus, key: deviceInfo.deviceKey },
        json: true
      };

      request.post(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
          _this.emit("sync-status", body );
        } else {
          // TODO: ERROR HANDLING
          console.log('error: '+ response.statusCode);
        }
      });

    },
    /**
     *
     */
    stopMonitoring: function( tweLiteSensor ){
      logger.info("stop monitoring request");
      var _this = this;
      var options = {
        uri: config.urlRoot + '/sensor_api/v1/sensors/' + tweLiteSensor.deviceInfo.deviceId + '/stop_monitoring',
        form: { _method: 'PUT', key: tweLiteSensor.deviceInfo.deviceKey },
        json: true
      };

      request.post(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
          _this.emit("start-monitoring", body );
        } else {
          // TODO: ERROR HANDLING
          console.log('error: '+ response.statusCode);
        }
      });
    },
    /**
     *
     */
    startMonitoring: function( tweLiteSensor){
      logger.info("start monitoring request");
      var _this = this;
      var options = {
        uri: config.urlRoot + '/sensor_api/v1/sensors/' + tweLiteSensor.deviceInfo.deviceId + '/start_monitoring',
        form: { _method: 'PUT', key: tweLiteSensor.deviceInfo.deviceKey },
        json: true
      };
      request.post(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
          _this.emit("start-monitoring", body );
        } else {
          // TODO: ERROR HANDLING
          console.log('error: '+ response);
        }
      });
    },
    /**
     *
     */
    ping: function( tweLiteSensor ){
      //TODO: implementation 
      logger.debug("post ping request : status = " + tweLiteSensor.mode );
      var _this = this;
      var options = {
        uri: config.urlRoot + '/sensor_api/v1/sensors/' + tweLiteSensor.deviceInfo.deviceId + '/heart_beat',
        form: { _method: 'PUT', status: tweLiteSensor.mode },
        json: true
      };

      request.post(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
          _this.emit("ping-response", body );
        } else {
          // TODO: ERROR HANDLING
          console.log('error: '+ response.statusCode);
        }
      });
    },
    getRunningStatus: function( tweLiteSensor ){
      var _this = this;
      var options = {
        uri: config.urlRoot + '/sensor_api/v1/sensors/' + tweLiteSensor.deviceInfo.deviceId + '/running_status',
        json: true
      };
      request.get(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
          _this.emit("get-running-status-response", body);
        } else {
          // TODO: ERROR HANDLING
          console.log('error: '+ response.statusCode);
        }
      });
    }
  });

  return HttpSyncer;

})();
