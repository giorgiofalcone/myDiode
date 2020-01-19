// http superDOC https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
// UDP superDOC https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const defaultPort = 1234;
const clientServer = true;
const events = require('events');
const myEmitter = new events.EventEmitter();

const dgram = require('dgram');
const crypto = require("../myCrypto");

const listen = (listenIP, listenPORT) =>
{
    const udp = dgram.createSocket('udp4');

    udp.on('listening', () =>
        {
            const address = udp.address();
            console.log('UDP Server listening on ' + address.address + ':' + address.port);
        }
    );

    udp.on('error', error => console.error(error) );

    udp.on('message', (message, remote) =>
        {
            console.log( remote.address + ':' + remote.port +' - ' + message);
            
            if( global.config.encryption )
            {
                const decrypted = crypto.decrypt( message );
                message = decrypted.toString("utf8");
            }

            myEmitter.emit( listenPORT, message)
            
        }
    );

    udp.bind(listenPORT, listenIP);
}

const send = (message, destIP, destPORT) =>
{
    if ( global.config.encryption ) message = crypto.encrypt( message ) 

    const packet = new Buffer( message );
    const udp = dgram.createSocket( {type: 'udp4', reuseAddr : true});

    udp.bind(defaultPort, () =>
        {
            udp.setBroadcast(true);

            udp.send(packet, 0, packet.length, destPORT, destIP, (err, bytes) =>
                {
                    if (err) throw err;
                    console.log( "UDP packet sent to " + destIP + ":" + destPORT)
                    udp.close();
                }
            );
        }
    );
}


module.exports = { listen, send, events : myEmitter , defaultPort, clientServer}
