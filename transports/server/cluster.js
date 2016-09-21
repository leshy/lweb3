(function(){
  var each, Backbone, helpers, subscriptionMan, core, util, cluster, validator, v, out$ = typeof exports != 'undefined' && exports || this;
  each = require('underscore').each;
  Backbone = require('backbone4000');
  helpers = require('helpers');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  util = require('util');
  cluster = require('cluster');
  validator = require('validator2-extras');
  v = validator.v;
  out$.clusterServer = core.server.extend4000({
    start: function(){
      var receiveWorker, this$ = this;
      receiveWorker = function(worker){
        return this$.receiveConnection(new this$.channelClass({
          parent: this$,
          worker: worker,
          name: 'worker-' + this$.channelName()
        }));
      };
      each(cluster.workers, receiveWorker);
      return cluster.on('online', receiveWorker);
    }
  });
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL25vZGUvbHdlYjMvdHJhbnNwb3J0cy9zZXJ2ZXIvY2x1c3Rlci5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztFQUdnQixJQUFkLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsQ0FBYztFQUNBLFFBQWQsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGNBQUE7RUFDQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBQ2tCLGVBQWxCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7RUFDQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBQ0EsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFNBQVUsQ0FBQSxDQUFBLENBQUUsUUFBUSxtQkFBRDtFQUF1QixDQUFFLENBQUEsQ0FBQSxDQUFFLFNBQVMsQ0FBQztPQUl0RCxnQkFBZSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQ3pCO0lBQUEsT0FBTyxRQUFBLENBQUE7O01BQ0wsYUFBYyxDQUFBLENBQUEsQ0FBRSxRQUFBLENBQUEsTUFBQTtlQUNkLEtBQUMsQ0FBQSxzQkFBc0IsS0FBQyxDQUFBLGFBQWE7VUFBQSxRQUFRO1VBQUcsUUFBUTtVQUFRLE1BQU0sU0FBVSxDQUFBLENBQUEsQ0FBRSxLQUFDLENBQUEsV0FBSCxDQUFjO1FBQXpELENBQUEsQ0FBbEI7O01BRXJCLEtBQUssT0FBTyxDQUFDLFNBQVMsYUFBakI7YUFDTCxPQUFPLENBQUMsR0FBRyxVQUFVLGFBQVY7O0VBTGIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxucmVxdWlyZSEgeyBcbiAgdW5kZXJzY29yZTogeyBlYWNoIH1cbiAgYmFja2JvbmU0MDAwOiBCYWNrYm9uZVxuICBoZWxwZXJzXG4gIHN1YnNjcmlwdGlvbm1hbjI6IHN1YnNjcmlwdGlvbk1hblxuICAnLi4vY29yZSdcbiAgdXRpbFxuICBjbHVzdGVyXG59XG5cbnZhbGlkYXRvciA9IHJlcXVpcmUoJ3ZhbGlkYXRvcjItZXh0cmFzJyk7IHYgPSB2YWxpZGF0b3IudlxuXG5leHBvcnRcblxuICBjbHVzdGVyU2VydmVyOiBjb3JlLnNlcnZlci5leHRlbmQ0MDAwIGRvXG4gICAgc3RhcnQ6IC0+XG4gICAgICByZWNlaXZlV29ya2VyID0gKHdvcmtlcikgfj4gXG4gICAgICAgIEByZWNlaXZlQ29ubmVjdGlvbiBuZXcgQGNoYW5uZWxDbGFzcyBwYXJlbnQ6IEAsIHdvcmtlcjogd29ya2VyLCBuYW1lOiAnd29ya2VyLScgKyBAY2hhbm5lbE5hbWUoKVxuICAgICAgICBcbiAgICAgIGVhY2ggY2x1c3Rlci53b3JrZXJzLCByZWNlaXZlV29ya2VyXG4gICAgICBjbHVzdGVyLm9uICdvbmxpbmUnLCByZWNlaXZlV29ya2VyXG4iXX0=
