var Stall = require("./stall.js");
var async = require('async');
var AliveMonitor = require('./alive_monitor.js');
var EventEmitter = require('events').EventEmitter;
var logger = require('./log.js');

module.exports  = (function(){

  var TweliteStallSensor = function( options ){
    var options = options || {};

    this.deviceInfo = options.deviceInfo;
    this.mode = TweliteStallSensor.MODE.sleeping;
    this.error = void(0);

    this.syncer = options.syncer; // required

    this.stalls = [];
    this._setUpStalls( options.stalls );

    // Ping
    this.pingTimer = void(0);
    this.pingInterval = this.deviceInfo.pingInterval;
    this.syncer.on("ping-response", this._onPingResponse.bind(this) );

    // TweLiteが生きているかどうかをモニタリングする
    this.aliveEventEmitter = new EventEmitter();
    this.aliveMonitor = new AliveMonitor( { emitter: this.aliveEventEmitter, timeout: this.deviceInfo.timeout } );
    this.aliveMonitor.startMonitoring();
    this.aliveEventEmitter.on( 'dead' , this._onDeviceDead.bind( this ) );

    this.syncer.on("get-running-status-response", this._onGetRunningStatusResponse.bind(this) );
  };

  TweliteStallSensor.PIN_INDEX = {
    "4": 0,
    "3": 1,
    "2": 2,
    "1": 3
  };
  TweliteStallSensor.MODE = {
    sleeping: "sleeping",
    running: "running",
    error: "error",
    dead: "dead",
  };
  TweliteStallSensor.prototype = {
    _onGetRunningStatusResponse: function( body ){
      var body = body || {};
      var switchToSleepMode = body.switch_to_sleep_mode + "";
      this.mode = {
        "0" : TweliteStallSensor.MODE.running,
        "1" : TweliteStallSensor.MODE.sleeping
      }[ switchToSleepMode ];
      if(  switchToSleepMode === "1" ){
        this.syncer.stopMonitoring( this );
      }
    },
    /**
     * シリアルポートからの入力を受け付ける
     */
    dataIn: function( input ){

      // TODO: Deadな状態から信号を受信した場合は復活する必要がある。
      
      if( this.mode === TweliteStallSensor.MODE.dead){
        this.syncer.getRunningStatus(this);
      }
      
      this.aliveEventEmitter.emit( 'data' );

      // Runningモード以外の場合はStallを更新しない
      if( this.mode !== TweliteStallSensor.MODE.running ){ 
        logger.debug("signal detected while not running");
        return false;
      }

      var a = input.substr(33,2);
      var b = parseInt( a, 16 ).toString("2");
      var c = ("0000"+b).slice(-4);

      var _this = this;
      async.each( this.stalls, function( stall ){
        var data = c.substr( TweliteStallSensor.PIN_INDEX[ stall.pinNo ] , 1);
        stall.toNextStatus( ( data === "1" )? Stall.STATUSES.OCCUPIED : Stall.STATUSES.VACANT );
        if( stall.isChangedToVacant() || stall.isChangedToOccupied() ){
          _this.syncer.syncStatus( _this.deviceInfo , stall );
        }
      });
    },
    /**
     * 監視スタート
     */
    start: function(){
      this.syncer.getRunningStatus( this );
      this.syncer.startMonitoring( this );
      this._pingStart();
    },
    /**
     * 監視ストップ
     */
    stop: function(){
      this.syncer.stopMonitoring( this );
      this.mode = TweliteStallSensor.MODE.sleeping;
      async.each(this.stalls, function( stall ){
        stall.toUnknown();
      });
    },
    /**
     * コンストラクタに与えられた情報を元に、
     * Stallオブジェクトを生成し、メンバ変数に配列として格納
     */
    _setUpStalls: function( stalls ){
      var _this = this;
      async.each( stalls, function( stall ){
        _this.stalls.push( new Stall({
          id: stall.id,
          pinNo: stall.pinNo,
        }));
      });
    },
    /**
     * Ping開始
     */
    _pingStart: function(){
      if( this.pingTimer ){ clearTimeout( this.pingTimer ); }
      var _this = this;
      var ping = function(){
        _this.pingTimer = setTimeout(function(){
          _this.syncer.ping( _this );
          ping();
        }, _this.pingInterval);
      }
      ping();
    },
    /**
     * SyncerオブジェクトがPingに成功した場合に実行
     */
    _onPingResponse: function(data){
      if( this.mode === TweliteStallSensor.MODE.running && data.switch_to_sleep_mode + "" === "1" ){
        this.stop();
      }
      if( this.mode === TweliteStallSensor.MODE.sleeping && data.switch_to_sleep_mode + "" === "0" ){
        this.start();
      }
    },
    /**
     * Pingを止める
     */
    _pingStop: function(){
      logger.info("stop ping");
      if( this.pingTimer ) clearTimeout(this.pingTimer);
    },
    _onDeviceDead: function(){
      // TODO: 
      // PING/heart_beatのパラメータにstatusではない何かを付与すべき。
      // statusはあくまでrunningかsleepingにしておいて、modeを変更したら....
      // DEADの場合は電池が無いですよ！とアナウンス
      if( this.mode !== TweliteStallSensor.MODE.dead){
        logger.error( "no signal from sensor while " + (this.aliveMonitor.timeout / 1000) + " seconds" );
      }
      this.mode = TweliteStallSensor.MODE.dead;
    },
    destroy: function(){
      this.stopMonitoring();
      this.aliveMonitor.stopMonitoring();
      this._pingStop();
    },
  };

  return TweliteStallSensor;

})();
