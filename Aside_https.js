// http superDOC https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
// UDP superDOC https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const https = require('https');
const dgram = require('dgram');
const crypto = require("./myCrypto");
const fs = require("fs")

const run = (listenIP, listenPORT, destIP, destPORT) =>
{
    const options = { pfx : fs.readFileSync( __dirname + '\\wild_ima.pfx' ) , passphrase : 'ima2019' }

    https.createServer( options, (request, response) =>
        {
            console.log( "createserver" )
            const { headers, method, url } = request;
            let body = [];

            delete headers["user-agent"];

            request.on('error', err => console.error(err))
                    .on('data', chunk => body.push(chunk))
                    .on('end', () =>
                {
                    body = Buffer.concat(body).toString();
                    // creates a text message in JSON format
                    const message = JSON.stringify( { method, url, headers, body} );
                    sendUDP(message, destIP, destPORT)
                    response.writeHead(200)
                    response.write("OK!")
                    response.end()
                }
            );
        }
    ).listen( listenPORT, listenIP, () => console.log( "HTTPS server listening on: " + listenIP + ":" + listenPORT )).on("error", error => console.error(error))
}

const sendUDP = (message, destIP, destPORT) =>
{
    let packet;

    if( process.env.ENCRYPTION == "true" )
    {
        packet = new Buffer( JSON.stringify( crypto.encrypt( message ) ) );
    }
    else packet = new Buffer( message );
    
    const udp = dgram.createSocket('udp4');

    udp.bind(1234,  () =>
        {
            udp.setBroadcast(true);

            debugger

            udp.send(packet, 0, packet.length, destPORT, destIP, (err, bytes) =>
                {
                    if (err) throw err;
                    console.log( "udp packet sent to " + destIP + ":" + destPORT)
                    udp.close();
                }
            );
        }
    );
}

module.exports = { run }