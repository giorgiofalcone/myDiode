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

const moduleMyBuffer = require( path.join(__dirname, "./myBuffer") )
const myBuffer = new moduleMyBuffer();

const moduleUdp = require("./module_udp");
const udp = new moduleUdp();

switch( global.config.side )
{
    case "A":
    {
        global.config.transmitNic = net.checkNIC( global.config.out );

        myBuffer.on("message", (message, port) => udp.send(message, port) )
        
        protocols.filter( name => name.includes(".js")).forEach( name =>
        {
            const moduleProto = require("./protocols/" + name)
            const protocol = new moduleProto();

            protocol.on( "message" , (message, port) => 
            {
                myBuffer.sendA( message, port)
            });
            
            protocol.listen()
        });        
    }
    break;

    case "B":
    {
        udp.on( "message" , (text, port) => myBuffer.sendB(text, port))

        protocols.filter( name => name.includes(".js")).forEach( name =>
        {
            const moduleProto = require("./protocols/" + name)
            const protocol = new moduleProto();

            // port number is used as key to send event data to the right protocol
            myBuffer.on( protocol.defaultPort(), message => protocol.send(message) )

            udp.listen( protocol.defaultPort() )
        });
    }
    break;

    case "C":
    {
        const crypto = require("./myCrypto")
        const message = "Test: success"
        console.log( crypto.decrypt( crypto.encrypt(message) ) )
    }
    break;

    default:
        console.error("bad arguments\nUsage: node app --side A --in --out !! node app --side B --in");
        process.exit(1)
}