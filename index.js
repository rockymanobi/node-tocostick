var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty.usbserial-AHXDVMCX", {
  baudrate: 115200,
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log("on Data");
    var st = data.toString();

    console.log(st.length);
    if( !st || st.length !== 51 ) return;
    console.log("rcv:" + data.toString());
  });
});

