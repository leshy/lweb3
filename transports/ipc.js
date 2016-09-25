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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy9sd2ViMy90cmFuc3BvcnRzL2lwYy5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztFQUdnQixRQUFkLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBO0VBQ2tCLGVBQWxCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTtFQUNlLEVBQWYsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGVBQUE7RUFDQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBR0YsU0FBVSxDQUFBLENBQUEsQ0FBRSxRQUFRLG1CQUFEO0VBQXVCLENBQUUsQ0FBQSxDQUFBLENBQUUsU0FBUyxDQUFDO29CQUVqRCxVQUFXLENBQUEsQ0FBQSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxTQUFTLENBQUMsZ0JBQ3BEO0lBQUEsV0FDRTtNQUFBLFNBQVM7SUFBVDtJQUVGLFVBQ0U7TUFBQSxNQUFNO0lBQU47SUFFRixZQUFZLFFBQUEsQ0FBQTs7TUFDVixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxJQUFDLENBQUEsSUFBSSxTQUFBO01BQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBRyxXQUFXLFFBQUEsQ0FBQSxHQUFBLEVBQUEsTUFBQTtlQUFpQixLQUFDLENBQUEsTUFBTSxLQUFLLEtBQUMsQ0FBQSxLQUFOO09BQW5DO01BQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFHLGNBQWMsUUFBQSxDQUFBO2VBQUcsS0FBQyxDQUFBLElBQUc7T0FBckI7TUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQUcsU0FBUyxRQUFBLENBQUE7ZUFBRyxLQUFDLENBQUEsSUFBRztPQUFoQjtNQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBRyxRQUFRLFFBQUEsQ0FBQTtlQUFHLEtBQUMsQ0FBQSxJQUFHO09BQWY7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQUcsU0FBUyxRQUFBLENBQUE7ZUFBRyxLQUFDLENBQUEsSUFBRztPQUFoQjs7SUFFZCxNQUFNLFFBQUEsQ0FBQSxFQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLEVBQUE7O0VBZHZCLENBRDBDIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxuXG5yZXF1aXJlISB7XG4gIGJhY2tib25lNDAwMDogQmFja2JvbmVcbiAgc3Vic2NyaXB0aW9ubWFuMjogc3Vic2NyaXB0aW9uTWFuXG4gIGNoaWxkX3Byb2Nlc3M6IGNwXG4gICcuLi9jb3JlJ1xufVxuXG52YWxpZGF0b3IgPSByZXF1aXJlKCd2YWxpZGF0b3IyLWV4dHJhcycpOyB2ID0gdmFsaWRhdG9yLnZcbiAgXG5leHBvcnQgaXBjQ2hhbm5lbCA9IGNvcmUuY2hhbm5lbC5leHRlbmQ0MDAwIHZhbGlkYXRvci52YWxpZGF0ZWRNb2RlbCwgZG9cbiAgdmFsaWRhdG9yOlxuICAgIHByb2Nlc3M6ICdJbnN0YW5jZSdcbiAgXG4gIGRlZmF1bHRzOlxuICAgIG5hbWU6ICdpcGMnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAcHJvY2VzcyA9IEBnZXQgJ3Byb2Nlc3MnXG4gICAgQHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAobXNnLCBoYW5kbGUpIH4+IEBldmVudCBtc2csIEByZWFsbVxuICAgIEBwcm9jZXNzLm9uICdkaXNjb25uZWN0Jywgfj4gQGVuZCFcbiAgICBAcHJvY2Vzcy5vbiAnZXJyb3InLCB+PiBAZW5kIVxuICAgIEBwcm9jZXNzLm9uICdleGl0Jywgfj4gQGVuZCFcbiAgICBAcHJvY2Vzcy5vbiAnY2xvc2UnLCB+PiBAZW5kIVxuICAgIFxuICBzZW5kOiAtPiBAcHJvY2Vzcy5zZW5kIGl0XG5cbiJdfQ==
