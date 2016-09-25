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
      return this.subscribed = false;
    },
    updateSub: function(){
      var sub, this$ = this;
      sub = function(){
        return new p(function(resolve, reject){
          var subName;
          this$.sub.subscribe(subName = "bus/" + map(keys(this$.tags).sort(), function(it){
            return it + ":" + this$.tags[it];
          }).join('|'));
          return this$.sub.once('subscribe', function(){
            console.log("SUB!", subName);
            this$.subscribed = true;
            return resolve();
          });
        });
      };
      if (this.subscribed) {
        this.sub.once('unsubscribe', sub);
        return this.sub.unsubscribe();
      } else {
        return sub();
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy9sd2ViMy9idXMvcmVkaXMubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHRSxLQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBO0VBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksSUFBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksSUFBWixFQUFrQixHQUFsQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWtCLEdBQWxCLEVBQXVCLFdBQXZCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUIsV0FBdkIsRUFBb0MsSUFBcEMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFvQztFQUNiLFFBQXZCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxxQkFBQTtFQUNVLENBQVYsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFVBQUE7RUFDa0IsZUFBbEIsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBO0VBQ0EsSUFBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FDeEI7SUFBQSxZQUFZLFFBQUEsQ0FBQTtNQUNWLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFFO01BQ1IsSUFBRyxDQUFJLElBQUMsQ0FBQSxHQUFMLENBQVMsTUFBRCxDQUFYO1FBQXlCLElBQUMsQ0FBQSxJQUFJO1VBQUEsTUFBTSxNQUFNLENBQUMsWUFBWSxFQUFELENBQUksQ0FBQyxTQUFTLFFBQUE7UUFBdEMsQ0FBQTs7TUFDOUIsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsS0FBSyxDQUFDLGFBQVk7TUFDekIsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsS0FBSyxDQUFDLGFBQVk7YUFDekIsSUFBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBLENBQUU7O0lBR2hCLFdBQVcsUUFBQSxDQUFBOztNQUNULEdBQUksQ0FBQSxDQUFBLENBQUUsUUFBQSxDQUFBO21CQUFPLEVBQUUsUUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBOztVQUNiLEtBQUMsQ0FBQSxHQUFHLENBQUMsVUFBVSxPQUFRLENBQUEsQ0FBQSxDQUFRLE1BQUMsQ0FBQSxDQUFBLENBQUUsR0FBRixDQUFPLElBQVAsQ0FBWSxLQUFDLENBQUEsSUFBRCxDQUFNLENBQUMsSUFBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsUUFBQSxDQUFBLEVBQUEsQ0FBMUIsQ0FBQTtBQUFBLFlBQUEsTUFBQSxDQUE2QixFQUFHLENBQUEsQ0FBQSxDQUFLLEdBQUMsQ0FBQSxDQUFBLENBQUUsS0FBQyxDQUFBLElBQUksQ0FBRSxFQUFGLENBQTdDLENBQUE7QUFBQSxVQUFBLENBQUssQ0FBK0MsQ0FBQyxJQUFyRCxDQUEwRCxHQUFBLENBQTNFO2lCQUNmLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxhQUFhLFFBQUEsQ0FBQTtZQUNyQixPQUFPLENBQUMsSUFBVSxRQUFFLE9BQUY7WUFDbEIsS0FBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBLENBQUU7bUJBQ2QsUUFBTztXQUhDO1NBRkc7O01BT2YsSUFBRyxJQUFDLENBQUEsVUFBSjtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxlQUFlLEdBQWY7ZUFDVixJQUFDLENBQUEsR0FBRyxDQUFDLFlBQVc7T0FFbEI7ZUFBSyxJQUFHOzs7SUFFVixRQUFRLFFBQUEsQ0FBQSxJQUFBO2NBQ04sSUFBQyxDQUFBLE1BQVM7YUFDVixJQUFDLENBQUEsVUFBUzs7SUFFWixRQUFRLFFBQUEsQ0FBQSxHQUFBO01BQ04sSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsS0FBSyxJQUFDLENBQUEsTUFBTSxHQUFQO2FBQ2IsSUFBQyxDQUFBLFVBQVM7O0VBNUJaLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG5cbnJlcXVpcmUhIHtcbiAgcmVkaXNcbiAgY3J5cHRvXG4gIGxlc2hkYXNoOiB7IGtleXMsIG1hcCwgZmxhdHRlbkRlZXAsIG9taXQgfVxuICAnYmFja2JvbmU0MDAwL2V4dHJhcyc6IEJhY2tib25lXG4gIGJsdWViaXJkOiBwXG4gIHN1YnNjcmlwdGlvbm1hbjI6IHN1YnNjcmlwdGlvbk1hblxuICAnLi4vY29yZSdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlLmJ1cy5leHRlbmQ0MDAwIGRvXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQHRhZ3MgPSB7ICB9XG4gICAgaWYgbm90IEBnZXQoJ25hbWUnKSB0aGVuIEBzZXQgbmFtZTogY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKS50b1N0cmluZyAnYmFzZTY0J1xuICAgIEBwdWIgPSByZWRpcy5jcmVhdGVDbGllbnQhXG4gICAgQHN1YiA9IHJlZGlzLmNyZWF0ZUNsaWVudCFcbiAgICBAc3Vic2NyaWJlZCA9IGZhbHNlXG5cblxuICB1cGRhdGVTdWI6IC0+XG4gICAgc3ViID0gfj4gbmV3IHAgKHJlc29sdmUscmVqZWN0KSB+PiBcbiAgICAgIEBzdWIuc3Vic2NyaWJlIHN1Yk5hbWUgPSBcImJ1cy9cIiArIG1hcCgoa2V5cyBAdGFncykuc29ydCEsIH4+IGl0ICsgXCI6XCIgKyBAdGFnc1sgaXQgXSkuam9pbiAnfCdcbiAgICAgIEBzdWIub25jZSAnc3Vic2NyaWJlJywgfj5cbiAgICAgICAgY29uc29sZS5sb2cgXCJTVUIhXCIsIHN1Yk5hbWVcbiAgICAgICAgQHN1YnNjcmliZWQgPSB0cnVlXG4gICAgICAgIHJlc29sdmUhXG5cbiAgICBpZiBAc3Vic2NyaWJlZFxuICAgICAgQHN1Yi5vbmNlICd1bnN1YnNjcmliZScsIHN1YlxuICAgICAgQHN1Yi51bnN1YnNjcmliZSFcbiAgICAgIFxuICAgIGVsc2Ugc3ViIVxuICAgIFxuICBhZGRUYWc6IChkYXRhKSAtPlxuICAgIEB0YWdzIDw8PCBkYXRhXG4gICAgQHVwZGF0ZVN1YiFcbiAgICBcbiAgZGVsVGFnOiAodGFnKSAtPlxuICAgIEB0YWdzID0gb21pdCBAdGFncywgdGFnXG4gICAgQHVwZGF0ZVN1YiFcbiJdfQ==
