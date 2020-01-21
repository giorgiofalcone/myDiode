const defaultPort = 1883;
const events = require("events")
const mqtt = require('mqtt');
let client;

class Protocol extends events
{
    constructor()
    {
        super()

        client = mqtt.connect( global.config.mqtt.broker, {clientId:"MQTTJS_" + global.config.side} )

        client.on("connect", () => console.log("MQTT connected: " + client.connected) );

        client.on("error", error => console.log("Connection error\n" + error) );
        
        client.subscribe( global.config.mqtt.topic , {qos : global.config.mqtt.qos} );
    }

    defaultPort()
    {
        return defaultPort;
    }
    
    listen()
    {
        client.on('message', (topic, message, packet) =>
        {
            const text = JSON.stringify( { topic:topic, message:message.toString("utf8")} )
            console.error( "listener: " + text)
            this.emit( "message", text, defaultPort )
        });
    }

    send (text)
    {
        console.log( "MQTT sender: " + text)

        try
        {
            const message = JSON.parse(text)
            client.publish( message["topic"], message["message"], {qos:2} )
        }
        catch (error) {console.error(error)}
    }
}

module.exports = Protocol