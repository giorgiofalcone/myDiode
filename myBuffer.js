const events = require('events');
const myEmitter = new events.EventEmitter();
const udp = require("./protocols/module_udp")
const db = [];

const sendA = ( message, ip, port) =>
{
    message = JSON.stringify( {timestamp : Date.now() , message : message} )
    put( message, ip, port , global.config.retry.times);
}

const put = (message, ip, port, retry) =>
{
    udp.send( message, ip, port )

    if( retry > 0 )
    {
        setTimeout( () =>
        {
            put(message, ip, port, --retry);
        }, global.config.retry.timeout);
    }
}

const sendB = (port, text) =>
{
    const message = JSON.parse( text )
    
    if( db[ message["timestamp"] ] )
    {
        if( --db[message["timestamp"] ] == 0 )
            delete db[message["timestamp"]]
    }
    else
    {
        db[ message["timestamp"] ] = (global.config.retry.times)
        myEmitter.emit( port , message["message"] );
    }
}

const readB = (events, port) =>
{
    events.on( port, text => sendB(port, text) );
}

module.exports = { /*listen, send, events : myEmitter, defaultPort, clientServer*/sendA, sendB, events : myEmitter , readB }