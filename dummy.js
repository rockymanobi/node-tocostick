var SerialPort = require("serialport").SerialPort
var TweliteStallSensor = require("./src/tweLite.js");
var TweLiteMonitor = require("./src/alive_monitor.js");
var HttpSyncer = require("./src/http_syncer.js");
var logger = require('./src/log.js');
var config = require("config");
var EventEmitter = require("events").EventEmitter
var ev = new EventEmitter();

logger.info("App START");

var tweLiteDevices = [
  {
    tweLiteDeviceId: "81005782",
  },
];

function getTweLiteDevice( serial ){
  var targetId = serial.substr( 11,8 );
  return tweLiteDevices.filter(function( d ){
    return d.tweLiteDeviceId === targetId;
  })[0];
}

var syncer = new HttpSyncer();
var deviceConf1 = config.devices[0];
var sensor1 = new TweliteStallSensor({
  deviceInfo: deviceConf1.deviceInfo,
  stalls: deviceConf1.stalls,
  syncer: syncer,
});

sensor1.start();

ev.on('serial-data', function ( data ) {

  var st = data.toString();
  // データ長
  if( !st || st.length !== 51 ) return;
  // 登録済twe-lightか
  // NOTE: このロジック、将来的にはTweLiteオブジェクトを抽出するようにすべきか。
  var tweLite = getTweLiteDevice( st );
  if ( !tweLite ){  return; }

  sensor1.dataIn( st );

  logger.debug("rcv:" + data.toString().replace("\r\n", ""));
}, 2000);




/**
 * read data from dummy serial
 */
function dummy(){
  var DummySerial =  require("./src/dummy_serial.js");
  var dummySerial = new DummySerial();

  setInterval( function () {
    var data = dummySerial.next(); 
    ev.emit( 'serial-data' ,data);
  }, 2000);
}

/**
 * read data from serial port
 */
function main(){
  var serialPort = new SerialPort("/dev/tty.usbserial-AHXDVMCX", {
    baudrate: 115200,
  });
  serialPort.on("open", function () {
    serialPort.on('data', function(data) {
      ev.emit( 'serial-data' ,data);
    });
  });
}

/********
 *
 ********/
switch (config.runningMode){
  case "main":
    main();
    break;
  case "dummy":
    dummy();
    break;
  default:
    console.log("noooo");
    break;
}



