const Discord = require('discord.js-selfbot-v11');
const Discord2 = require('discord.js')
// const momentTimezone = require('moment-timezone')
const moment = require('moment')
const schedule = require('node-schedule')
const config = require('./config.json');
const path = require('path')
// Create a new client instance
const client = new Discord.Client();
const client2 = new Discord2.Client();
const prefix = ">"
// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!', client.user);
    // const wok = new wokcommands(client,{
    //     commandsDir: path.join(__dirname, 'commands'),
    //     showWarns: true,
    //     defaultPrefix: '?',
    //     debug: true
    // })

    // new wokcommands(client, {
    //     commandsDir: path.join(__dirname, 'commands'),
    //     showWarns: true,
    //     debug: true,
    // })/*.setMongoPath(process.env.MONGO_URI)*/
    client.guilds.array().forEach((value, index, array) => {
        console.log('----------------------------------------------')
        console.log('guild name', value.name)
        // console.log('guild id', value.id)
        value.channels.forEach(value1 => {
            console.log('Channel name', value1.name)
            console.log('Channel id', value1.id)
        })

    })
    // const guild = client.guilds.get('guildid');
    // guild.channels.get('channelid')
});


client2.on('message', message => {
    // console.log(`Message received \n\t${message.content}\n\t${message.client.user.username}\n` );
    console.log(`Message received \n\t${message}` );
    let content = message.content;
    // Do not edit this
    if (content.startsWith(prefix)) {
        content = content.replace(">", "")
        if (content.startsWith("schedule")) {
            console.log(content)
            content = content.replace("schedule ", "")
            handleScheduleMessage(message, content)
        }
    } else {
        if(message.id === client.user){
            // console.log(message.content)
            // console.log('Same id', message.id ,'===' ,client.user.id)
        }
        // handleAutoReplyMessage(content, message);
    }

})


// Login to Discord with your client's token
console.log('token: ', config["token"])
client.login(config["token"]).then(r => {
    console.log('loggedin: ', r);
}).catch(err => {
    console.log('ERROR: ', err);
});


async function handleAutoReplyMessage(content, message) {
    const lowerCaseContent = content.toLowerCase();
    const conditions = [
        lowerCaseContent.startsWith('Hey'.toLowerCase()),
        lowerCaseContent.startsWith('Hi'.toLowerCase()),
        lowerCaseContent.startsWith('Hello'.toLowerCase()),
        lowerCaseContent.startsWith('Whats up'.toLowerCase()),
        lowerCaseContent.startsWith('What\'s up'.toLowerCase())
    ]

    if (conditions.includes(true)) {
        const replies = [
            'How are you?',
            ''
        ]
        setTimeout(() => {
            message.reply('How are you?')
        }, 6 * 1000)

    }
}

/**
 * Check this out
 * */
async function handleScheduleMessage(message, content) {
    // const format =  '<server id> <channel name> <YYYY/MM/DD> <HH:mm> <"AM" or "PM"> <Timezone> <Repetition>';
    // const format =  '<channel id> <YYYY/MM/DD> <HH:mm> <"AM" or "PM">';
    // const format =  '<channel id> <YYYY-MM-DD HH:mm "am" or "pm">';
    // const format =  '<channelId1,channelId2,,channelId3...> <YYYY-MM-DD HH:mm:ss "am" or "pm"> <message>';
    // const format =  '>schedule <channelName1,channelName2,,channelName3...> <YYYY-MM-DD HH:mm:ss "am" or "pm"> <message>';
    const format = '>schedule <channelId1,channelId2,,channelId3...> <YYYY-MM-DD HH:mm:ss "am" or "pm"> <message>';

    console.log('Inside handleMessage,', content)
    const params = content
        .substring(1, content.length - 1)
        .split(/[>\]] [<\[]/)

    console.log(JSON.stringify(params))
    if (params.length < 3) {
        message.reply(`Schedule parameters are not correct.\nCorrect format is: ${format}`)
    } else {
        // const channelId = '968940524352442443'
        const channelIdsParam = params[0]
        const dateParam = params[1]
        const messageParam = params[2]
        const targetDate = moment(dateParam, 'YYYY-MM-DD HH:mm:ss a').toDate()
        console.log(channelIdsParam, dateParam, targetDate)
        schedule.scheduleJob(targetDate, () => {
            console.log('Scheduling job')
            const channelIds = channelIdsParam.split(",")
            let timeout = 1500;
            channelIds.forEach(channelId => {
                console.log('Channel: ', channelId)
                console.log('Timeout: ', timeout)
                setTimeout(() => {
                    // const channelToSend = client.channels.find(channel => channel.id === channelId)
                    console.log('After timeout for : ', channelId)
                    // const channelToSend = client.channels.find(channel => channel.name === channelId)
                    const channelToSend = client.channels.find(channel => channel.id === channelId)
                    if (channelToSend) {
                        channelToSend.send(messageParam)
                    } else {
                        console.log('Channel not found for : ', channelId)
                    }
                }, timeout)
                timeout += timeout;

            })
        })

    }
}
