const defaultPort = 1883;
const clientServer = false;
const events = require("events")
const myEmitter = new events.EventEmitter();

const mqtt = require('mqtt');

const listen = () =>
{
    const client = mqtt.connect( global.config.mqtt.brokerListen )

    client.on("connect", () => console.log("MQTT connected: " + client.connected) );

    client.on("error", error => console.log("Connection error\n" + error) );

    client.on('message', (topic, message, packet) =>
    {
        const text = JSON.stringify( { topic:topic, message:message.toString("utf8")} )
        console.error( "listener: " + text)
        myEmitter.emit( defaultPort, text )
    });

    client.subscribe( "#" , {qos:2} );
}

const send = events =>
{
    const client = mqtt.connect( global.config.mqtt.brokerListen, {clientId:"MQTTJS"} )

    client.on("connect", () => console.log("MQTT connected: " + client.connected) );

    client.on("error", error => console.log("Connection error\n" + error) );

    events.on( defaultPort, text => 
        {
            console.log( "MQTT sender: " + text)

            try
            {
                const message = JSON.parse(text)
                client.publish( message["topic"], message["message"], {qos:2} )
            }
            catch (error) {console.error(error)}
        }
    );
    
}

module.exports = { listen, send, events: myEmitter , defaultPort, clientServer }