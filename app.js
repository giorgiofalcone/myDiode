const fs = require("fs")
const path = require('path');

global.config = JSON.parse( fs.readFileSync( path.join(__dirname, 'config.json') ) )
require("./myArgs").parse();

const net = require("./myNetwork");
const protocols = fs.readdirSync( path.join(__dirname, 'protocols/') );
const listenNic = net.checkNIC( global.config.in );
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
            
            protocol.clientServer ? protocol.listen(listenNic.IP) : protocol.listen();
        });
    }
    break;

    case "B":
    {
        const IP = process.platform === "win32" ? listenNic.IP : listenNic.IPbcast;
        const udp = require("./protocols/module_udp");

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

            udp.listen(IP, protocol.defaultPort)
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