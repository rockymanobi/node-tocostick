module.exports = {
  devices: [
    {
      deviceInfo: {
        deviceId: "asl1",
        deviceKey: "aslpass",
        pingInterval: 10000,  /** msec */
        timeout: 30000,  /** msec */
      },
      stalls: [
        { 
          pinNo: "4",
          id: "asl-stall1"
        },
        { 
          pinNo: "3",
          id: "asl-stall2"
        },
      ],
    }
  ],
  urlRoot: "http://localhost:3000", 
  /** main: read from serial port , dummy: read from dummy data */
  runningMode: "dummy", 
  log4js: {
    "configure": {
      "appenders": [
        {
          "category": "system",
          "type": "console"
        },
        {
          "category": "access",
          "type": "console"
        },
        {
          "category": "error",
          "type": "console"
        }
      ],
      "levels": {
        system: "ALL"
      }
    }
  }

};
