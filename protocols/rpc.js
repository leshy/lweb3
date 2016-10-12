(function(){
  var util, ref$, flattenDeep, each, p, Backbone, subscriptionMan, core, query, validator, v, remoteObject, client, server, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
  util = require('util');
  ref$ = require('leshdash'), flattenDeep = ref$.flattenDeep, each = ref$.each;
  p = require('bluebird');
  Backbone = require('backbone4000');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  query = require('./query');
  validator = require('validator2-extras');
  v = validator.v;
  out$.remoteObject = remoteObject = (function(){
    remoteObject.displayName = 'remoteObject';
    var prototype = remoteObject.prototype, constructor = remoteObject;
    function remoteObject(parent, name, methods){
      var this$ = this;
      each(methods, function(method){
        return this$[method] = function(){
          var args;
          args = slice$.call(arguments);
          return parent.remoteCall(name, method, args);
        };
      });
    }
    return remoteObject;
  }());
  out$.client = client = core.protocol.extend4000({
    defaults: {
      name: 'rpcClient'
    },
    requires: [query.client],
    functions: function(){
      var this$ = this;
      return {
        remoteObject: function(){
          return this$.remoteObject.apply(this$, arguments);
        }
      };
    },
    remoteCall: function(name, method, args){
      var this$ = this;
      return new p(function(resolve, reject){
        return this$.parent.query({
          rpc: name,
          method: method,
          args: args
        }, function(msg, end){
          if (msg.err) {
            return reject(msg.err);
          } else {
            return resolve(msg.data);
          }
        });
      });
    },
    remoteObject: function(name){
      var methods;
      methods = slice$.call(arguments, 1);
      return new remoteObject(this, name, flattenDeep(methods));
    }
  });
  out$.server = server = core.protocol.extend4000({
    defaults: {
      name: 'rpcServer'
    },
    requires: [query.server],
    functions: function(){
      var this$ = this;
      return {
        exportObject: function(){
          return this$.remoteObject.apply(this$, arguments);
        }
      };
    },
    initialize: function(){
      var this$ = this;
      this.remoteObjects = {};
      return this.when('parent', function(parent){
        return parent.onQuery({
          rpc: String,
          method: String,
          args: Array
        }, function(msg, reply){
          var obj, res;
          if (!(obj = this$.remoteObjects[msg.rpc])) {
            return reply.end({
              err: 'not found'
            });
          }
          return res = obj[msg.method].apply(obj, msg.args).then(function(res){
            return reply.end({
              data: res
            });
          })['catch'](function(err){
            return reply.end({
              err: err
            });
          });
        });
      });
    },
    remoteObject: function(name, obj){
      return this.remoteObjects[name] = obj;
    }
  });
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL25vZGUvbHdlYjMvcHJvdG9jb2xzL3JwYy5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztFQUdFLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLE1BQUE7RUFDQSxJQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFhLFdBQWIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFhLFdBQWIsRUFBMEIsSUFBMUIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwQjtFQUNoQixDQUFWLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBO0VBRWMsUUFBZCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQTtFQUVrQixlQUFsQixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUE7RUFDQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBQ0EsS0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFNBQVUsQ0FBQSxDQUFBLENBQUUsUUFBUSxtQkFBRDtFQUF1QixDQUFFLENBQUEsQ0FBQSxDQUFFLFNBQVMsQ0FBQztzQkFFM0MsZ0JBQU4sUUFBQSxDQUFBOzs7SUFDTCxRQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7TUFDRSxLQUFLLFNBQVMsUUFBQSxDQUFBLE1BQUE7ZUFDWixLQUFDLENBQUMsTUFBRCxDQUFTLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7VUFBSTtpQkFBUyxNQUFNLENBQUMsV0FBVyxNQUFNLFFBQVEsSUFBZDs7T0FEeEM7Ozs7Z0JBSUYsTUFBTyxDQUFBLENBQUEsQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQzFCO0lBQUEsVUFDSTtNQUFBLE1BQU07SUFBTjtJQUVKLFVBQVUsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUVWLFdBQVcsUUFBQSxDQUFBOzthQUNQO1FBQUEsY0FBYyxRQUFBLENBQUE7aUJBQUksS0FBQyxDQUFBLG1DQUFhOztNQUFoQzs7SUFFSixZQUFZLFFBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLElBQUE7O2lCQUE0QixFQUFFLFFBQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQTtlQUN4QyxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU07VUFBQSxLQUFLO1VBQU0sUUFBUTtVQUFRLE1BQU07UUFBakMsR0FBdUMsUUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBO1VBQ25ELElBQUcsR0FBRyxDQUFDLEdBQVA7bUJBQWdCLE9BQU8sR0FBRyxDQUFDLEdBQUo7V0FBUTttQkFBSyxRQUFRLEdBQUcsQ0FBQyxJQUFKOztTQURoQztPQUQwQjs7SUFJMUMsY0FBYyxRQUFBLENBQUEsSUFBQTs7TUFBVTtNQUN0QixNQUFBLENBQUEsSUFBVyxZQUFYLENBQXdCLElBQXhCLEVBQTJCLElBQTNCLEVBQWlDLFdBQWpDLENBQTZDLE9BQUEsQ0FBckIsQ0FBeEI7O0VBYkYsQ0FBQTtnQkFlRyxNQUFPLENBQUEsQ0FBQSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FDMUI7SUFBQSxVQUNJO01BQUEsTUFBTTtJQUFOO0lBRUosVUFBVSxDQUFFLEtBQUssQ0FBQyxNQUFSO0lBRVYsV0FBVyxRQUFBLENBQUE7O2FBQ1A7UUFBQSxjQUFjLFFBQUEsQ0FBQTtpQkFBSSxLQUFDLENBQUEsbUNBQWE7O01BQWhDOztJQUVKLFlBQVksUUFBQSxDQUFBOztNQUNWLElBQUMsQ0FBQSxhQUFjLENBQUEsQ0FBQSxDQUFFO2FBRWpCLElBQUMsQ0FBQSxLQUFLLFVBQVUsUUFBQSxDQUFBLE1BQUE7ZUFDZCxNQUFNLENBQUMsUUFBUTtVQUFBLEtBQUs7VUFBUSxRQUFRO1VBQVEsTUFBTTtRQUFuQyxHQUEwQyxRQUFBLENBQUEsR0FBQSxFQUFBLEtBQUE7O1VBQ3ZELElBQUcsQ0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQUUsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBTCxDQUF4QixDQUFIO1lBQTBDLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixDQUFpQixDQUFqQjtBQUFBLGNBQWlCLEdBQWpCLEVBQXNCLFdBQXRCO0FBQUEsWUFBaUIsQ0FBQSxDQUFqQjs7aUJBRTFDLEdBQUksQ0FBQSxDQUFBLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQVQsQ0FDNUIsQ0FBQyxLQUFLLFFBQUEsQ0FBQSxHQUFBO21CQUFTLEtBQUssQ0FBQyxJQUFJO2NBQUEsTUFBTTtZQUFOLENBQUE7V0FBbkIsQ0FDTixDQUFDLE9BQUQsRUFBTyxRQUFBLENBQUEsR0FBQTttQkFBUyxLQUFLLENBQUMsSUFBSTtjQUFBLEtBQUs7WUFBTCxDQUFBO1dBQW5CO1NBTE07T0FEWDs7SUFRUixjQUFjLFFBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBRCxDQUFPLENBQUEsQ0FBQSxDQUFFOztFQXBCekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIiNhdXRvY29tcGlsZVxuXG5yZXF1aXJlISB7XG4gIHV0aWxcbiAgbGVzaGRhc2ggOiB7IGZsYXR0ZW5EZWVwLCBlYWNoIH1cbiAgYmx1ZWJpcmQ6IHBcbiAgXG4gIGJhY2tib25lNDAwMDogQmFja2JvbmVcbiAgXG4gIHN1YnNjcmlwdGlvbm1hbjI6IHN1YnNjcmlwdGlvbk1hblxuICAnLi4vY29yZSdcbiAgJy4vcXVlcnknXG59XG5cbnZhbGlkYXRvciA9IHJlcXVpcmUoJ3ZhbGlkYXRvcjItZXh0cmFzJyk7IHYgPSB2YWxpZGF0b3IudlxuXG5leHBvcnQgY2xhc3MgcmVtb3RlT2JqZWN0XG4gIChwYXJlbnQsIG5hbWUsIG1ldGhvZHMpIC0+XG4gICAgZWFjaCBtZXRob2RzLCAobWV0aG9kKSB+PlxuICAgICAgQFttZXRob2RdID0gKC4uLmFyZ3MpIC0+IHBhcmVudC5yZW1vdGVDYWxsIG5hbWUsIG1ldGhvZCwgYXJnc1xuXG4gICAgXG5leHBvcnQgY2xpZW50ID0gY29yZS5wcm90b2NvbC5leHRlbmQ0MDAwIGRvXG4gICAgZGVmYXVsdHM6XG4gICAgICAgIG5hbWU6ICdycGNDbGllbnQnXG4gICAgICAgIFxuICAgIHJlcXVpcmVzOiBbIHF1ZXJ5LmNsaWVudCBdXG5cbiAgICBmdW5jdGlvbnM6IC0+XG4gICAgICAgIHJlbW90ZU9iamVjdDogfj4gIEByZW1vdGVPYmplY3QgLi4uXG5cbiAgICByZW1vdGVDYWxsOiAobmFtZSwgbWV0aG9kLCBhcmdzKSAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+XG4gICAgICBAcGFyZW50LnF1ZXJ5IHJwYzogbmFtZSwgbWV0aG9kOiBtZXRob2QsIGFyZ3M6IGFyZ3MsIChtc2csZW5kKSAtPlxuICAgICAgICBpZiBtc2cuZXJyIHRoZW4gcmVqZWN0IG1zZy5lcnIgZWxzZSByZXNvbHZlIG1zZy5kYXRhXG4gICAgICBcbiAgICByZW1vdGVPYmplY3Q6IChuYW1lLCAuLi5tZXRob2RzKSAtPlxuICAgICAgcmV0dXJuIG5ldyByZW1vdGVPYmplY3QgQCwgbmFtZSwgZmxhdHRlbkRlZXAgbWV0aG9kc1xuXG5leHBvcnQgc2VydmVyID0gY29yZS5wcm90b2NvbC5leHRlbmQ0MDAwIGRvXG4gICAgZGVmYXVsdHM6XG4gICAgICAgIG5hbWU6ICdycGNTZXJ2ZXInXG4gICAgICAgIFxuICAgIHJlcXVpcmVzOiBbIHF1ZXJ5LnNlcnZlciBdXG5cbiAgICBmdW5jdGlvbnM6IC0+XG4gICAgICAgIGV4cG9ydE9iamVjdDogfj4gIEByZW1vdGVPYmplY3QgLi4uXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgQHJlbW90ZU9iamVjdHMgPSB7fVxuICAgICAgXG4gICAgICBAd2hlbiAncGFyZW50JywgKHBhcmVudCkgfj4gXG4gICAgICAgIHBhcmVudC5vblF1ZXJ5IHJwYzogU3RyaW5nLCBtZXRob2Q6IFN0cmluZywgYXJnczogQXJyYXksIChtc2cscmVwbHkpIH4+XG4gICAgICAgICAgaWYgbm90IG9iaiA9IEByZW1vdGVPYmplY3RzW21zZy5ycGNdIHRoZW4gcmV0dXJuIHJlcGx5LmVuZCBlcnI6ICdub3QgZm91bmQnXG5cbiAgICAgICAgICByZXMgPSBvYmpbbXNnLm1ldGhvZF0uYXBwbHkgb2JqLCBtc2cuYXJnc1xuICAgICAgICAgIC50aGVuIChyZXMpIC0+IHJlcGx5LmVuZCBkYXRhOiByZXNcbiAgICAgICAgICAuY2F0Y2ggKGVycikgLT4gcmVwbHkuZW5kIGVycjogZXJyXG4gICAgICAgICAgXG4gICAgcmVtb3RlT2JqZWN0OiAobmFtZSwgb2JqKSAtPlxuICAgICAgQHJlbW90ZU9iamVjdHNbbmFtZV0gPSBvYmpcblxuIl19
