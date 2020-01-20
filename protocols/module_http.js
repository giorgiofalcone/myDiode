const defaultPort = 8080;
const clientServer = true;
const events = require('events');
const myEmitter = new events.EventEmitter();

const http = require('http');

const listen = () =>
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
 
                const message = JSON.stringify( { method, url, headers, body} );

                myEmitter.emit( defaultPort , message);

                response.writeHead(202)
                response.write("forwarded")
                response.end()
            }
        );
    });
    
    server.on("error", error => console.error(error) )

    server.listen(defaultPort, global.config.listenNic.IP, () => console.log( "HTTP server listening at " + global.config.listenNic.IP + ":" + defaultPort ));
}

const send = text =>
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
            timeout: 50000
        }

        const request = http.request(options)
        if( message["body"]) request.write( message["body"] )
        request.end();
        request.on('error', error => 
        {
            console.error(error)
            setTimeout( () => send(text), 60000)
        });

    }
    catch (error)
    {
        console.error(error)    
    }   
}


module.exports = { listen, send, events : myEmitter, defaultPort, clientServer }
