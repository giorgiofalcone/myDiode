// http superDOC https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
// UDP superDOC https://www.hacksparrow.com/nodejs/udp-server-and-client-example.html

const defaultPort = 8080;
const clientServer = true;
const events = require('events');
const myEmitter = new events.EventEmitter();

const http = require('http');

const listen = (listenIP) =>
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

    server.listen(defaultPort, listenIP, () => console.log( "HTTP server listening at " + listenIP + ":" + defaultPort ));
}

const send = text =>
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


    console.log(options)

    const request = http.request(options)
    if( message["body"]) request.write( message["body"] )
    request.end();
    request.on('error', error => 
        {
            console.error(error)
            setTimeout( text => send(text), 60000)
        } );

}


module.exports = { listen, send, events : myEmitter, defaultPort, clientServer }
