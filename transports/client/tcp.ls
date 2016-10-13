#autocompile
require! {
  net
  '../../core'
}

module.exports <<< require '../tcp'

export tcpClient = exports.tcpSocketChannel.extend4000 do
  defaults:
    name: 'tcpClient'

  initialize: ->
    @set socket: @socket = new net.Socket()

  connect: (opts, cb) ->
    opts = {} <<< @attributes{ host, port } <<< opts
    try
      @socket.connect opts
    catch err
      cb err
    @socket.once 'connect', cb
    
