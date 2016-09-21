(function(){
  var Backbone, subscriptionMan, core, cp, ipcChannel, validator, v, ipcClient, out$ = typeof exports != 'undefined' && exports || this;
  Backbone = require('backbone4000');
  subscriptionMan = require('subscriptionman2');
  core = require('../../core');
  cp = require('child_process');
  ipcChannel = require('../ipc').ipcChannel;
  validator = require('validator2-extras');
  v = validator.v;
  out$.ipcClient = ipcClient = ipcChannel.extend4000({
    validator: {
      process: 'Instance'
    },
    defaults: {
      name: 'ipcClient',
      process: process
    },
    initialize: function(){
      return this.send({
        ready: true
      });
    }
  });
}).call(this);
