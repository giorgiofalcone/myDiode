const dgram = require('dgram')
const fetch = require("node-fetch")
const udp = dgram.createSocket('udp4');
const crypto = require("./myCrypto");

const run = (listenIP, listenPORT, destination) =>
{
    udp.on('listening', () =>
        {
            const address = udp.address();
            console.log('UDP Server listening on ' + address.address + ':' + address.port);
        }
    );

    udp.on('error', err => console.error(err) );

    udp.on('message', (message, remote) =>
        {
            console.log(remote.address + ':' + remote.port +' - ' + message);
            
            let packet;

            if( process.env.ENCRYPTION == "true" )
            {
                const decrypted = crypto.decrypt( JSON.parse(message) );
                packet = JSON.parse( decrypted.toString("utf8") );
                console.log( JSON.stringify( packet, null, 3) );
            }
            else packet = JSON.parse(message);

            const url = process.env.PROXY === "true"? packet.url : destination 

            fetch( url , { method: packet.method, headers: packet.headers, body: packet.body === "" ? null: packet.body })
/*                 .then( res => res.text() )
                .then( body => console.log(body) ) */
                .catch()
        }
    );

    udp.bind(listenPORT, listenIP);
}

module.exports = { run }