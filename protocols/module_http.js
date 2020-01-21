const defaultPort = 8080;
const events = require('events');
const http = require('http');

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
        const server = http.createServer( (request, response) =>
        {
            const { headers, method, url } = request;
            let body = [];

            request.on('error', err => console.error(err))
                .on('data', chunk => body.push(chunk))
                .on('end', () =>
                {
                    body = Buffer.concat(body).toString();
    
                    const text = JSON.stringify( { method, url, headers, body} );

                    this.emit( "message", text, defaultPort);

                    response.writeHead(202)
                    response.write("forwarded")
                    response.end()
                }
            );
        });
        
        server.on("error", error => console.error(error) )

        server.listen(defaultPort, global.config.listenNic.IP, () => console.log( "HTTP server listening at " + global.config.listenNic.IP + ":" + defaultPort ));
    };

    send(text)
    {
        try
        {
            const message = JSON.parse( text )
            
            let params = global.config.http.proxy ? message.headers["host"] : global.config.http.destination ;

            params = params.split(":")

            const options = {
                hostname: params[0],
                port: params[1] ? params[1] : 80,
                path: message["url"],
                method: message["method"],
                headers: message["headers"],
                timeout: global.config.http.timeout
            }

            const request = http.request(options)

            request.on('error', error => 
            {
                console.error(error)
                setTimeout( ( ) => this.send(text), 100000)
            });

            if( message["body"] != "" ) request.write( message["body"] )
            request.end();
        }
        catch (error)
        {
            console.error(error);
            setTimeout( ( ) => this.send(text), 100000);
        }   
    }
}

module.exports = Protocol