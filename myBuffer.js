const events = require('events');
const db = [];

class myBuffer extends events
{
    constructor()
    {
        super()
    }
    
    sendA(message, port)
    {
        message = JSON.stringify( {timestamp : Date.now() , message : message} )
        this.recursiveSend( message, port , global.config.retry.times);
    }

    recursiveSend (message, port, retry)
    {
        this.emit("message", message, port )

        if( retry > 0 )
        {
            setTimeout( () =>
            {
                this.recursiveSend(message, port, --retry);
            }, global.config.retry.timer);
        }
    }
    
    sendB(text, port)
    {
        const message = JSON.parse( text )

        if( db[ message["timestamp"] ] )
        {
            if(  --db[message["timestamp"]] == 0 ) delete db[ message["timestamp"] ]
        }
        else
        {
            db[ message["timestamp"] ] = (global.config.retry.times)
            this.emit( port , message["message"] );
        }
    }

}

module.exports = myBuffer