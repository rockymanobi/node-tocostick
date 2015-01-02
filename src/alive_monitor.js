var config = require("config");
module.exports =  (function(){
  var AliveMonitor = function( options ){
    this.emitter = options.emitter;
    this.timeout = options.timeout || 10000;
    this.interval = options.interval || 5000;
    this.timer = void(0);
    this.baseTime = void(0);

    this.emitter.on('data', this.onData.bind(this) );
  };

  AliveMonitor.prototype = {
    startMonitoring: function(){
      var _this = this;
      this.baseTime = new Date();
      this.timer = setInterval(function(){
        var current = new Date();
        if( current - _this.baseTime > _this.timeout ){
          _this.emitter.emit( "dead" );
        }
      },this.interval);
    },
    stopMonitoring: function(){
      clearInterval( this.timer );
    },
    onData: function(){
      this.baseTime = new Date();
    }
  };

  return AliveMonitor;

})();
