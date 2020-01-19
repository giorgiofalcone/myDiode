// http superDOC https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
// UDP superDOC https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const defaultPort = 8443;
const clientServer = true;
const events = require('events');
const myEmitter = new events.EventEmitter();

const https = require('https');
const path = require('path');

const listen = (listenIP) =>
{
    const fs = require("fs")

    const options = {
        key: fs.readFileSync( path.join(__dirname, './httpsKeys/dec.pem') ),
        cert: fs.readFileSync( path.join(__dirname,'./httpsKeys/cert.pem') )
    };

    const server = https.createServer( options, (request, response) =>
    {
        const { headers, method, url } = request;
        let body = [];

        request.on('error', err => console.error(err))
                .on('data', chunk => body.push(chunk))
                .on('end', () =>
            {
                body = Buffer.concat(body).toString();

                const message = JSON.stringify( { method, url, headers, body} );
                
                myEmitter.emit( defaultPort, message)

                response.writeHead(202)
                response.write("forwarded")
                response.end()
            }
        );
    });

    server.on("error", error => console.error(error) )

    server.listen( defaultPort, listenIP, () => console.log( "HTTPS server listening on: " + listenIP + ":" + defaultPort ))
}

const send = message =>
{
    const fetch = require("node-fetch")
    // IGNORE SSL ERRORS
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const packet = JSON.parse( message )
    const url = process.env.PROXY === "true"? packet.url : DESTINATION 
    const body = packet.body === "" ? null: packet.body ;

    fetch( url , { method: packet.method, headers: packet.headers, body: body })
        .then( res => res.text() )
        .then( body => console.log(body) )
        .catch()
}

module.exports = { listen, send, events : myEmitter , defaultPort, clientServer }