var SerialPort = require("serialport").SerialPort
var TweliteStallSensor = require("./src/twelite.js");
var TweLiteMonitor = require("./src/alive_monitor.js");
var HttpSyncer = require("./src/http_syncer.js");

var sensorId = "asl1";
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







var config = require("./config.js");
var syncer = new HttpSyncer();
var sensor1 = new TweliteStallSensor({
  deviceInfo: config.deviceInfo,
  stalls: config.stalls,
  syncer: syncer,
});

var serialPort = new SerialPort(config.serialPort, {
  baudrate: 115200,
});

serialPort.on("open", function () {

  sensor1.start();

  serialPort.on('data', function(data) {
    var st = data.toString();
    // データ長
    if( !st || st.length !== 51 ) return;
    // 登録済twe-lightか
    // NOTE: このロジック、将来的にはTweLiteオブジェクトを抽出するようにすべきか。
    var tweLite = getTweLiteDevice( st );
    if ( !tweLite ){  return; }

    sensor1.dataIn( st );

    console.log("rcv:" + data.toString());
  });
});

