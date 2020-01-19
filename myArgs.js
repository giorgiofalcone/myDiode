const parse = () =>
{
    process.argv.forEach( (arg, index, thisarg) =>
    {
        if( arg.startsWith( "--" ) ) global.config[ thisarg[index].substring(2) ] = thisarg[index+1] 
    });

}

module.exports = { parse }