// http superDOC https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
// UDP superDOC https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const http = require('http');
const dgram = require('dgram');
const crypto = require("./myCrypto");

const run = (listenIP, listenPORT, destIP, destPORT) =>
{
    http.createServer( (request, response) =>
        {
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
    ).listen(listenPORT, listenIP, () => console.log( "HTTP server listening on: " + listenIP + ":" + listenPORT ));
}

const sendUDP = (message, destIP, destPORT) =>
{
/*     let packet; */

    if( process.env.ENCRYPTION == "true" )
    {
        const crypted = crypto.encrypt( message ) 
        message = JSON.stringify( crypted )
/*         packet = new Buffer( JSON.stringify( crypto.encrypt( message ) ) ); */
    }
    
    const packet = new Buffer( message );
    
    const udp = dgram.createSocket('udp4');

    udp.bind(1234, () =>
        {
            udp.setBroadcast(true);

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