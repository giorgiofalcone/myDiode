const broadcastAddress = require('broadcast-address');
const os = require("os");
const nics = os.networkInterfaces();

const IPbcast = interface => broadcastAddress(interface);

const isInterface = interface => Object.keys(nics).includes(interface);

const IP = interface =>
{
    const res = nics[interface].filter( element => element.family != "IPv6" );
    return res[0].address;
}

const checkNIC = userinput =>
{
    if( !isInterface( userinput ) )
    {
        console.error( "error: NIC \""  + userinput + "\" is not present. Please check for typo" )
        process.exit(127)
    }
    else return { IP: IP( userinput ) , IPbcast : IPbcast( userinput )  }
}

module.exports = { checkNIC }