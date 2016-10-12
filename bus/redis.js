(function(){
  var redis, crypto, ref$, keys, map, flattenDeep, omit, Backbone, p, subscriptionMan, core;
  redis = require('redis');
  crypto = require('crypto');
  ref$ = require('leshdash'), keys = ref$.keys, map = ref$.map, flattenDeep = ref$.flattenDeep, omit = ref$.omit;
  Backbone = require('backbone4000/extras');
  p = require('bluebird');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  module.exports = core.bus.extend4000({
    initialize: function(){
      this.tags = {};
      if (!this.get('name')) {
        this.set({
          name: crypto.randomBytes(32).toString('base64')
        });
      }
      this.pub = redis.createClient();
      this.sub = redis.createClient();
      return this.sub.on('pmessage', function(pattern, channel, message){
        return console.log("MSG IN", message);
      });
    },
    send: function(to, msg){
      return console.log("bus/" + this.makeName(to, "|"));
    },
    makeName: function(data, separator){
      var this$ = this;
      separator == null && (separator = " ");
      return map(keys(data).sort(), function(it){
        var val;
        if ((val = data[it]) === true) {
          val = "";
        }
        return it + ":" + val;
      }).join(separator);
    },
    updateSub: function(){
      var this$ = this;
      return new p(function(resolve, reject){
        var subscribe;
        subscribe = function(){
          return this$.each(this$.tags, function(value, key){
            if (value) {
              return true;
            }
          });
        };
        if (!this$._subscribed) {
          return subscribe();
        }
        this$.sub.unsubscribe();
        return this$.sub.once('unsubscribe', subscribe);
      });
    },
    addTag: function(data){
      import$(this.tags, data);
      return this.updateSub();
    },
    delTag: function(tag){
      this.tags = omit(this.tags, tag);
      return this.updateSub();
    }
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy9sd2ViMy9idXMvcmVkaXMubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHRSxLQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksSUFBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksSUFBWixFQUFrQixHQUFsQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWtCLEdBQWxCLEVBQXVCLFdBQXZCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUIsV0FBdkIsRUFBb0MsSUFBcEMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFvQztFQUNiLFFBQXZCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxxQkFBQTtFQUNVLENBQVYsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFVBQUE7RUFDa0IsZUFBbEIsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBO0VBQ0EsSUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FFeEI7SUFBQSxZQUFZLFFBQUEsQ0FBQTtNQUNWLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFFO01BQ1IsSUFBRyxDQUFJLElBQUMsQ0FBQSxHQUFMLENBQVMsTUFBRCxDQUFYO1FBQXlCLElBQUMsQ0FBQSxJQUFJO1VBQUEsTUFBTSxNQUFNLENBQUMsWUFBWSxFQUFELENBQUksQ0FBQyxTQUFTLFFBQUE7UUFBdEMsQ0FBQTs7TUFDOUIsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsS0FBSyxDQUFDLGFBQVk7TUFDekIsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsS0FBSyxDQUFDLGFBQVk7YUFDekIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFHLFlBQVksUUFBQSxDQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQTtlQUE2QixPQUFPLENBQUMsSUFBWSxVQUFFLE9BQUY7T0FBN0Q7O0lBRVYsTUFBTSxRQUFBLENBQUEsRUFBQSxFQUFBLEdBQUE7YUFDSixPQUFPLENBQUMsSUFBVSxNQUFDLENBQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFILENBQVksRUFBWixFQUFtQixHQUFSLENBQVo7O0lBRXBCLFVBQVUsUUFBQSxDQUFBLElBQUEsRUFBQSxTQUFBOztNQUFPLHNCQUFBLFlBQWE7YUFDNUIsSUFBSyxLQUFLLElBQUEsQ0FBSyxDQUFDLEtBQUksR0FBRyxRQUFBLENBQUEsRUFBQTs7UUFDckIsSUFBc0IsQ0FBbEIsR0FBSSxDQUFBLENBQUEsQ0FBRSxJQUFJLENBQUUsRUFBRixDQUFRLENBQUEsQ0FBQSxHQUFBLENBQUcsSUFBekI7VUFBbUMsR0FBSSxDQUFBLENBQUEsQ0FBRTs7ZUFDekMsRUFBRyxDQUFBLENBQUEsQ0FBSyxHQUFDLENBQUEsQ0FBQSxDQUFFO09BRlYsQ0FFYyxDQUFDLEtBQUssU0FBQTs7SUFFekIsV0FBVyxRQUFBLENBQUE7O2lCQUFPLEVBQUUsUUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBOztRQUNsQixTQUFVLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTtpQkFDVixLQUFDLENBQUEsS0FBSyxLQUFDLENBQUEsTUFBTSxRQUFBLENBQUEsS0FBQSxFQUFBLEdBQUE7WUFBZ0IsSUFBRyxLQUFIO3FCQUFjOztXQUFyQzs7UUFFUixJQUFHLENBQUksS0FBQyxDQUFBLFdBQVI7VUFBeUIsTUFBQSxDQUFPLFNBQVAsQ0FBZ0IsQ0FBaEI7O1FBQ3pCLEtBQUMsQ0FBQSxHQUFHLENBQUMsWUFBVztlQUNoQixLQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssZUFBZSxTQUFmO09BTlE7O0lBUXBCLFFBQVEsUUFBQSxDQUFBLElBQUE7Y0FDTixJQUFDLENBQUEsTUFBUzthQUNWLElBQUMsQ0FBQSxVQUFTOztJQUVaLFFBQVEsUUFBQSxDQUFBLEdBQUE7TUFDTixJQUFDLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBRSxLQUFLLElBQUMsQ0FBQSxNQUFNLEdBQVA7YUFDYixJQUFDLENBQUEsVUFBUzs7RUE3QlosQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxucmVxdWlyZSEge1xuICByZWRpc1xuICBjcnlwdG9cbiAgbGVzaGRhc2g6IHsga2V5cywgbWFwLCBmbGF0dGVuRGVlcCwgb21pdCB9XG4gICdiYWNrYm9uZTQwMDAvZXh0cmFzJzogQmFja2JvbmVcbiAgYmx1ZWJpcmQ6IHBcbiAgc3Vic2NyaXB0aW9ubWFuMjogc3Vic2NyaXB0aW9uTWFuXG4gICcuLi9jb3JlJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmUuYnVzLmV4dGVuZDQwMDAgZG9cblxuICBpbml0aWFsaXplOiAtPlxuICAgIEB0YWdzID0ge31cbiAgICBpZiBub3QgQGdldCgnbmFtZScpIHRoZW4gQHNldCBuYW1lOiBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpLnRvU3RyaW5nICdiYXNlNjQnXG4gICAgQHB1YiA9IHJlZGlzLmNyZWF0ZUNsaWVudCFcbiAgICBAc3ViID0gcmVkaXMuY3JlYXRlQ2xpZW50IVxuICAgIEBzdWIub24gJ3BtZXNzYWdlJywgKHBhdHRlcm4sY2hhbm5lbCxtZXNzYWdlKSAtPiBjb25zb2xlLmxvZyBcIk1TRyBJTlwiLCBtZXNzYWdlXG5cbiAgc2VuZDogKHRvLCBtc2cpIC0+IFxuICAgIGNvbnNvbGUubG9nIFwiYnVzL1wiICsgQG1ha2VOYW1lKHRvLCBcInxcIilcblxuICBtYWtlTmFtZTogKGRhdGEsIHNlcGFyYXRvcj1cIiBcIikgLT5cbiAgICBtYXAoKGtleXMgZGF0YSkuc29ydCEsIH4+XG4gICAgICBpZiAodmFsID0gZGF0YVsgaXQgXSkgaXMgdHJ1ZSB0aGVuIHZhbCA9IFwiXCJcbiAgICAgIGl0ICsgXCI6XCIgKyB2YWwpLmpvaW4gc2VwYXJhdG9yIFxuICBcbiAgdXBkYXRlU3ViOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+IFxuICAgIHN1YnNjcmliZSA9IH4+XG4gICAgICBAZWFjaCBAdGFncywgKHZhbHVlLCBrZXkpIC0+IGlmIHZhbHVlIHRoZW4gdHJ1ZVxuICAgICAgXG4gICAgaWYgbm90IEBfc3Vic2NyaWJlZCB0aGVuIHJldHVybiBzdWJzY3JpYmUhXG4gICAgQHN1Yi51bnN1YnNjcmliZSFcbiAgICBAc3ViLm9uY2UgJ3Vuc3Vic2NyaWJlJywgc3Vic2NyaWJlXG4gICAgXG4gIGFkZFRhZzogKGRhdGEpIC0+XG4gICAgQHRhZ3MgPDw8IGRhdGFcbiAgICBAdXBkYXRlU3ViIVxuICAgIFxuICBkZWxUYWc6ICh0YWcpIC0+XG4gICAgQHRhZ3MgPSBvbWl0IEB0YWdzLCB0YWdcbiAgICBAdXBkYXRlU3ViIVxuXG5cbiJdfQ==
