const defaultPort = 1234;
const events = require('events');
const dgram = require('dgram');
const crypto = require("./myCrypto");
const IP = process.platform === "win32" ? global.config.listenNic.IP : global.config.listenNic.IPbcast;

class Protocol extends events
{
    constructor()
    {
        super()
    }

    listen ( listenPORT )
    {
        const udp = dgram.createSocket( {type: 'udp4', reuseAddr : true});
        udp.on('listening', () =>
        {
            const address = udp.address();
            console.log('UDP Server listening on ' + address.address + ':' + address.port);
        });

        udp.on('error', error => console.error(error) );

        udp.on('message', (message, remote) =>
        {
//            console.log( remote.address + ':' + remote.port +' - ' + message);

            if( global.config.encryption )
            {
                const decrypted = crypto.decrypt( message );
                message = decrypted.toString("utf8");
            }

            this.emit( "message", message, listenPORT)
        });

        udp.bind( listenPORT, IP);
    }

    send( message, port )
    {
        const udp = dgram.createSocket( {type: 'udp4', reuseAddr : true});
        if ( global.config.encryption ) message = crypto.encrypt( message ) 

        const sendBuf = Buffer.from( message );

        udp.bind(defaultPort, () =>
        {
            udp.setBroadcast(true);

            udp.send(sendBuf, 0, sendBuf.length, port, global.config.transmitNic.IPbcast , (err, bytes) =>
            {
                if (err) console.error(err);
                console.log( "UDP packet sent to " + global.config.transmitNic.IPbcast + ":" + port)
                //udp.close();
            });
        });
    }

}

module.exports = Protocol