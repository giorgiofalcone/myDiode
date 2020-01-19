const fs = require("fs");
const crypto = require('crypto');
const path = require('path');
const algorithm = 'aes-256-ctr';

const keyPath = path.join(__dirname, 'certs/key.json');
const key = Buffer.from( JSON.parse( fs.readFileSync( keyPath ) ) )

const encrypt = text =>
{
    const iv = crypto.randomBytes(16) ;
    const cipher = crypto.createCipheriv( algorithm, key, Buffer.from(iv) );
    let crypted = cipher.update( text, 'utf8', 'hex' );
    crypted += cipher.final('hex');
    return JSON.stringify( {iv : iv , crypted: crypted} );
}

const decrypt = text =>
{
    const data = JSON.parse( text );
    const iv =  data["iv"]
    const decipher = crypto.createDecipheriv( algorithm, key, Buffer.from( iv ) );
    let dec = decipher.update( data["crypted"], 'hex', 'utf8' );
    dec += decipher.final('utf8');
    return dec;
}

module.exports = { encrypt, decrypt }