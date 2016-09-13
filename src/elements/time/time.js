var Time = window.Time || {};

Time = function () {

  this._hr = function(time) {
    time = time - (Math.floor(time / 12) * 12);
  	return time == 0 ? 12 : time;
  };

  this._getStandardTime = function(time) {
    time = time.split(':');
    var hr = Number(time[0]);
    var min = Number(time[1]);
    var val = '' + this._hr(hr);
    val += min < 10 ? ':0' + min : ':' + min;
    val += (hr < 12 || hr > 24 || hr == 24 && min > 0) ? 'am' : 'pm';
    return val;
  };
  
  this._getTime = function(time) {
    if(time.indexOf('25:') === 0){
      time = time.split('25:').join('01:');
      return new Date("2016/01/02 " + time).getTime();
    }else if(time.indexOf('24:') === 0){
      time = time.split('24:').join('00:');
      return new Date("2016/01/02 " + time).getTime();
    }
    return new Date("2016/01/01 " + time).getTime();
  };

  return {
    getStandardTime : this._getStandardTime.bind(this),
    getTime: this._getTime.bind(this)
  };

}();