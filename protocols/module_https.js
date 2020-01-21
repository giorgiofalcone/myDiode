const defaultPort = 8443;
const events = require('events');
const https = require('https');

class Protocol extends events
{
    constructor()
    {
        super()
    }

    defaultPort()
    {
        return defaultPort;
    }
    
    listen()
    {
        const fs = require("fs")
        const path = require('path');

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

                    const text = JSON.stringify( { method, url, headers, body} );
                    
                    this.emit( "message", text, defaultPort)

                    response.writeHead(202)
                    response.write("forwarded")
                    response.end()
                }
            );
        });

        server.on("error", error => console.error(error) )

        server.listen( defaultPort, global.config.listenNic.IP, () => console.log( "HTTPS server listening on: " + global.config.listenNic.IP + ":" + defaultPort ))
    }

    send( text )
    {
        try
        {
            const message = JSON.parse( text )

            let params = global.config.https.proxy ? message.headers["host"] : global.config.https.destination ;

            params = params.split(":")

            const options = {
                hostname: params[0],
                port: params[1] ? params[1] : 80,
                path: message["url"],
                method: message["method"],
                headers: message["headers"],
                timeout: global.config.http.timeout
            }

            const request = https.request(options)
            
            request.on('error', error => 
            {
                console.error(error)
                setTimeout( ( ) => this.send(text), 100000)
            });

            if( message["body"] != "") request.write( message["body"] )
            request.end();
        }
        catch (error)
        {
            console.error(error)
            setTimeout( ( ) => this.send(text), 100000)
        }   
    }
}

module.exports = Protocol