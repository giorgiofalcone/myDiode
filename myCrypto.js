const fs = require("fs");
const crypto = require('crypto');
const path = require('path');
const algorithm = 'aes-256-ctr';

const keyPath = path.join(__dirname, 'key.json');

/* console.log( keyPath ) */

const key = Buffer.from( JSON.parse( fs.readFileSync( keyPath ) ) )

const encrypt = text =>
{
    const iv = Buffer.from( crypto.randomBytes(16) );
    const cipher = crypto.createCipheriv( algorithm, key, iv );
    let crypted = cipher.update( text, 'utf8', 'hex' );
    crypted += cipher.final('hex');
    return {iv : iv , crypted: crypted};
}

const decrypt = data =>
{
    const iv = Buffer.from( data["iv"] );
    const decipher = crypto.createDecipheriv( algorithm, key, iv);
    let dec = decipher.update( data["crypted"], 'hex', 'utf8' );
    dec += decipher.final('utf8');
    return dec;
}

module.exports = { encrypt, decrypt }