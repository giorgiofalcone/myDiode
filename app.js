const fs = require("fs")
const path = require('path');
// read configs from config.json
global.config = JSON.parse( fs.readFileSync( path.join(__dirname, 'config.json') ) )
// read parameters form argv
require("./myArgs").parse();
// myNetwork is used to check if interface name exists and returns local and broadcast IP 
const net = require("./myNetwork");
// scan for all modules in protocol folder
const protocols = fs.readdirSync( path.join(__dirname, 'protocols/') );
// checks if --in parameter is a correct interface name
global.config.listenNic = net.checkNIC( global.config.in );

const myBuffer = require( path.join(__dirname, "./myBuffer") )

switch( global.config.side )
{
    case "A":
    {
        const transmitNic = net.checkNIC( global.config.out );

        protocols.filter( name => name.includes(".js")).forEach( name =>
        {
            const protocol = require("./protocols/" + name)

            protocol.events.on( protocol.defaultPort , 
                message => myBuffer.sendA( message, transmitNic.IPbcast, protocol.defaultPort ))
            
            protocol.listen()
            //protocol.clientServer ? protocol.listen(listenNic.IP) : protocol.listen();
        });
    }
    break;

    case "B":
    {
        const udp = require("./module_udp");

        protocols.filter( name => name.includes(".js")).forEach( name =>
        {
            const protocol = require("./protocols/" + name)

            if( protocol.clientServer )
            {
                udp.events.on( protocol.defaultPort , message => myBuffer.sendB(protocol.defaultPort, message  ))
                myBuffer.events.on( protocol.defaultPort, message => protocol.send(message) )
            }
            else
            {
                myBuffer.readB( udp.events, protocol.defaultPort )
                protocol.send( myBuffer.events )
            }

            udp.listen( protocol.defaultPort)
        });
    }
    break;

    case "C":
        const crypto = require("./myCrypto")
        const message = "Test: success"

        console.log( crypto.decrypt( crypto.encrypt(message) ) )

        break;


    default:
        console.error("bad arguments\nUsage: node app --side A --in --out !! node app --side B --in");
        process.exit(1)
}