require! {
  dgram
  'validator2-extras': { v, ValidatedModel }
  '../../core': core
}


udpServer = exports.udpServer = core.channel.extend4000 ValidatedModel,
  validator:
    port: Number
    address: v().Default('0.0.0.0').String()

  defaults:
    name: 'UDPs'

  initialize: -> 
    @server = dgram.createSocket("udp4")
    @server.on 'error', (err) ~>
      @server.close!
      @end!

    @server.on "message" (msg, rinfo) ~> 
      try
        msg = JSON.parse(msg)
        @event msg
      catch
        console.log e
        
    @server.on "listening", ~> 
      address = @server.address()

    try
      @server.bind do
        port: @get 'port'
        address: @get 'address'
    catch
      console.log e
      @end!

  end: ->
    @server.close!
    core.core::end.call @
