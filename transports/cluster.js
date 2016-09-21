(function(){
  var _, Backbone, helpers, subscriptionMan, core, util, cluster, validator, v, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
  _ = require('underscore');
  Backbone = require('backbone4000');
  helpers = require('helpers');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  util = require('util');
  cluster = require('cluster');
  validator = require('validator2-extras');
  v = validator.v;
  out$.clusterChannel = core.channel.extend4000({
    initialize: function(){
      return process.on('message', partialize$.apply(this, [this.event, [void 8, this.realm], [0]]));
    },
    send: function(msg){
      return process.send(msg);
    }
  });
  function partialize$(f, args, where){
    var context = this;
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ?
        partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
    };
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL25vZGUvbHdlYjMvdHJhbnNwb3J0cy9jbHVzdGVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR2MsQ0FBWixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQTtFQUNjLFFBQWQsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGNBQUE7RUFDQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBQ2tCLGVBQWxCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7RUFDQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBQ0EsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFNBQVUsQ0FBQSxDQUFBLENBQUUsUUFBUSxtQkFBRDtFQUF1QixDQUFFLENBQUEsQ0FBQSxDQUFFLFNBQVMsQ0FBQztPQUd0RCxpQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUMzQjtJQUFBLFlBQVksUUFBQSxDQUFBO2FBQUcsT0FBTyxDQUFDLEdBQUcsNkJBQVksT0FBQSxJQUFDLENBQUEsZ0JBQVMsSUFBQyxDQUFBLGFBQXZCOztJQUMxQixNQUFNLFFBQUEsQ0FBQSxHQUFBO2FBQVMsT0FBTyxDQUFDLEtBQUssR0FBQTs7RUFENUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxucmVxdWlyZSEgeyBcbiAgdW5kZXJzY29yZTogX1xuICBiYWNrYm9uZTQwMDA6IEJhY2tib25lXG4gIGhlbHBlcnNcbiAgc3Vic2NyaXB0aW9ubWFuMjogc3Vic2NyaXB0aW9uTWFuXG4gICcuLi9jb3JlJ1xuICB1dGlsXG4gIGNsdXN0ZXJcbn1cblxudmFsaWRhdG9yID0gcmVxdWlyZSgndmFsaWRhdG9yMi1leHRyYXMnKTsgdiA9IHZhbGlkYXRvci52XG5cbmV4cG9ydFxuICBjbHVzdGVyQ2hhbm5lbDogY29yZS5jaGFubmVsLmV4dGVuZDQwMDAgZG9cbiAgICBpbml0aWFsaXplOiAtPiBwcm9jZXNzLm9uICdtZXNzYWdlJywgKEBldmVudCBfLCBAcmVhbG0pXG4gICAgc2VuZDogKG1zZykgLT4gcHJvY2Vzcy5zZW5kIG1zZ1xuIl19
