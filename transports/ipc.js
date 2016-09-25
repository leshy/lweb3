(function(){
  var Backbone, subscriptionMan, cp, core, validator, v, ipcChannel, out$ = typeof exports != 'undefined' && exports || this;
  Backbone = require('backbone4000');
  subscriptionMan = require('subscriptionman2');
  cp = require('child_process');
  core = require('../core');
  validator = require('validator2-extras');
  v = validator.v;
  out$.ipcChannel = ipcChannel = core.channel.extend4000(validator.validatedModel, {
    validator: {
      process: 'Instance'
    },
    defaults: {
      name: 'ipc'
    },
    initialize: function(){
      var this$ = this;
      this.process = this.get('process');
      this.process.on('message', function(msg, handle){
        return this$.event(msg, this$.realm);
      });
      this.process.on('disconnect', function(){
        return this$.end();
      });
      this.process.on('error', function(){
        return this$.end();
      });
      this.process.on('exit', function(){
        return this$.end();
      });
      return this.process.on('close', function(){
        return this$.end();
      });
    },
    send: function(it){
      return this.process.send(it);
    }
  });
}).call(this);
