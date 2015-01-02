module.exports  = (function(){

  var Stall = function(options){
    this.currentStatus = Stall.STATUSES.UNKNOWN;
    this.prevStatus = Stall.STATUSES.UNKNOWN;

    this.id = options.id; // require
    this.pinNo = options.pinNo; // require
  };

  Stall.STATUSES = {
    UNKNOWN: "unknown",
    VACANT: "vacant",
    MAYBE_VACANT: "maybe_vacant",
    OCCUPIED: "occupied",
    MAYBE_OCCUPIED: "maybe_occupied",
  };

  Stall.prototype = {
    toNextStatus: function( detectedStatus ){

      if( detectedStatus !== Stall.STATUSES.OCCUPIED && detectedStatus !== Stall.STATUSES.VACANT ){ throw "UNKNOWN STATUS" };

      this.prevStatus = this.currentStatus;
      switch ( detectedStatus ){
        case Stall.STATUSES.VACANT:
          if(this.prevStatus === Stall.STATUSES.OCCUPIED){
            this.currentStatus = Stall.STATUSES.MAYBE_VACANT
          }else{
            this.currentStatus = Stall.STATUSES.VACANT
          }
          break;
        case Stall.STATUSES.OCCUPIED:
          if(this.prevStatus === Stall.STATUSES.VACANT){
            this.currentStatus = Stall.STATUSES.MAYBE_OCCUPIED
          }else{
            this.currentStatus = Stall.STATUSES.OCCUPIED
          }
          break;
      }
    },
    toUnknown: function(){
      this.prevstatus = Stall.STATUSES.UNKNOWN;
      this.currentStatus = Stall.STATUSES.UNKNOWN;
    },
    isChangedToVacant: function(){
      return this.prevStatus !== Stall.STATUSES.VACANT
        && this.prevStatus !== Stall.STATUSES.MAYBE_OCCUPIED
        && this.currentStatus === Stall.STATUSES.VACANT;
    },
    isChangedToOccupied: function(){
      return this.prevStatus !== Stall.STATUSES.OCCUPIED
        && this.prevStatus !== Stall.STATUSES.MAYBE_VACANT
        && this.currentStatus === Stall.STATUSES.OCCUPIED;
    },
  };

  return Stall;

})();
