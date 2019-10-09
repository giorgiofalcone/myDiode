const parse = () =>
{
    let args = new Object()

    process.argv.forEach( (arg, index, thisarg) =>
        {
            if( arg.startsWith( "--" ) )
                args[ thisarg[index].substring(2) ] = thisarg[index+1];
        }   
    );
    
    return args;
}

module.exports = { parse }