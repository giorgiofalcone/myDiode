require("dotenv").config({path: __dirname + '/.env'})
const myArgs = require("./myArgs");
const net = require("./myNetwork");
const args = myArgs.parse();

const HTTP_PORT = process.env.HTTP_PORT || 8080 ;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443 ;
const UDP_PORT = process.env.UDP_PORT || 12345 ;
const DESTINATION = process.env.DESTINATION || "localhost:2222" ;

switch( args["side"] )
{
/*     case "A":
        const listennic = net.checkNIC( args["int"] );    
        const transmitnic = net.checkNIC( args["ext"] );
        const A = require("./Aside")
        console.log( "Starting A side")
        A.run( listennic.IP, HTTP_PORT, transmitnic.IPbcast, UDP_PORT)
        
    break; */

    case "A":
        const listennic = net.checkNIC( args["int"] );    
        const transmitnic = net.checkNIC( args["ext"] );
        const A = require("./Aside_https")
        console.log( "Starting A side")
        A.run( listennic.IP, HTTPS_PORT, transmitnic.IPbcast, UDP_PORT)
        
    break;

    case "B":
        const IPb = net.checkNIC( args["int"]) 
        const B = require("./Bside")
        console.log( "Starting B side")
        const IP = process.platform === "win32" ? IPb.IP : IPb.IPbcast;
        B.run( IP , UDP_PORT, DESTINATION )

    break;

    default:
        console.error("bad arguments\nUsage: node app --side A --int --ext !! node app --side B --int"); process.exit(1)
}