const Discord = require('discord.js-selfbot-v11');
const Discord2 = require('discord.js')
const moment = require('moment')
const config = require('./config.json');
const mongoose = require('mongoose');
const client = new Discord.Client();
const client2 = new Discord2.Client();
const userMetaDataSchema = require('./UserMetaData')
const prefix = ">"
let repliedToUsers = []
let isBotOn = false;
let channelsAllowed= []
function setupMongoose() {
    mongoose.connect('mongodb+srv://faizanje:gonawazgo1@cluster0.ytrc6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(async (res) => {
        console.log('mongoose connected');
        const users = await userMetaDataSchema.find()
        console.log('previous users', users);
        if (users) {
            repliedToUsers = [...users];
            // repliedToUsers.push.apply(repliedToUsers,...users);
        }
        console.log('replied array', repliedToUsers);
    })
        .catch(err => {
            console.log('mongoose error', err);
        });
}
setupDiscordBot();

function hasAlreadyRepliedTo(username) {
    const user = repliedToUsers.find(user => user.userID === username);
    const isUserFound = !!user;
    if (isUserFound) {
        const currentDateTime = moment()
        const duration = 2
        const repliedAtDateTime = moment(user.timeInMillis).add(duration, "hours")
        // const duration = 1
        // const repliedAtDateTime = moment(user.timeInMillis).add(duration, "minute")
        const result = !repliedAtDateTime.isBefore(currentDateTime)
        console.log(`Already replied ${username}? !${repliedAtDateTime}.isBefore(${currentDateTime}) === ${result}`)
        return result;
    }
    return false;

}


function setupDiscordBot() {
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
        // client.guilds.array().forEach((value, index, array) => {
        //     console.log('----------------------------------------------')
        //     console.log('guild name', value.name)
        //     // console.log('guild id', value.id)
        //     value.channels.forEach(value1 => {
        //         console.log('Channel name', value1.name)
        //         console.log('Channel id', value1.id)
        //     })
        //
        // })
        // const guild = client.guilds.get('guildid');
        // guild.channels.get('channelid')
    });


    client.on('message', message => {

        console.log(`Message received`);
        // console.log(`Message received \n\t${message.content}\n\t${message.id}\n` );
        // console.log(`Message received \n\t${message}`,message);

        let content = message.content;
        // Do not edit this
        if (content.startsWith(prefix)) {
            content = content.replace(">", "")
            if (content.startsWith("schedule")) {
                console.log(content)
                content = content.replace("schedule ", "")
                handleScheduleMessage(message, content)
            } else if (content.startsWith("bot")) {
                content = content.replace("bot ", "")
                handleBotSwitch(message, content)
            }else if(content.startsWith("channel")){
                content = content.replace("channel ", "")
                handleBotChannels(message, content)
            }
        } else if (isBotOn && !isFromCurrentLoggedInUser(message)) {
            console.log(message.content, message.author.username, '!==', client.user.username)
            handleAutoReplyMessage(content, message);
        } else {
            if (!isBotOn) {
                console.log('bot is off')
            }
        }

    })


// Login to Discord with your client's token
    console.log('token: ', config["token"])
    client.login(config["token"]).then(r => {
        console.log('loggedin: ', r);
    }).catch(err => {
        console.log('ERROR: ', err);
    });
}

async function handleAutoReplyMessage(content, message) {
    const lowerCaseContent = content.toLowerCase();
    const conditions = [
        lowerCaseContent.startsWith('Hey'.toLowerCase()),
        lowerCaseContent.startsWith('Hi'.toLowerCase()),
        lowerCaseContent.startsWith('Hello'.toLowerCase()),
        lowerCaseContent.startsWith('Whats up'.toLowerCase()),
        lowerCaseContent.startsWith('What\'s up'.toLowerCase())
    ]

    const messageChannelId = message.channel.id
    const isChannelAllowed = channelsAllowed.includes(messageChannelId)

    if (conditions.includes(true) /*&& isChannelAllowed*/) {

        if (!hasAlreadyRepliedTo(message.author.username)) {
            console.log('Havent replied to', message.author.username)
            const replies = [
                'Hey, How are you?',
                'Hey there! What’s going on?\n' +
                'Good to see you again.',
                'How are things going?\n' +
                'How do you get to know about this project?',
                'How are you doing?\n' +
                'What do you think about this project?',
                'Hello! How do you do?\n' +
                'Have you done any other project? How did it go?',
                'How have you been?\n' +
                'How many other projects are you working on right now?',
                'Hey mate! Sup?\n' +
                'How is your work going over here?',
                'Hello! hope you are doing good.\n' +
                'How long have you been here?',
                'How was your day?\n' +
                'Good to have you here!'
            ]
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            setTimeout(() => {
                console.log('Sending reply to', message.author.username)
                message.reply(randomReply)
                const repliedTo = {
                    userID: message.author.username,
                    repliedByUserID: client.user.username
                };
                const userMetaData = new userMetaDataSchema({
                    _id: message.author.id,
                    userID: message.author.username,
                    repliedByUserID: client.user.username
                })
                repliedToUsers.push(repliedTo)
                userMetaData.update(userMetaData, {upsert: true})
            }, 6 * 1000)

        }
    }
}

function getParams(content) {
    const params = content
        .substring(1, content.length - 1)
        .split(/[>\]] [<\[]/)
    return params;
}

function getChannelById(channelId) {
    return client.channels.find(channel => channel.id === channelId);
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
    const params = getParams(content);

    console.log(JSON.stringify(params))
    if (params.length < 3) {
        onIncorrectParams(message, format);
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
                    const channelToSend = getChannelById(channelId)
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



function handleBotSwitch(message, content) {
    const format = '>bot <on/off>';
    console.log('Inside handleBotSwitch,', content)
    const params = getParams(content);
    console.log('Params:', JSON.stringify(params))
    if (params.length < 1) {
        onIncorrectParams(message, format);
    } else {
        const statusStr = params[0]
        if (statusStr.toLowerCase() === 'on'.toLowerCase()) {
            isBotOn = true
        } else if (statusStr.toLowerCase() === 'off'.toLowerCase()) {
            isBotOn = false
        } else {
            onIncorrectParams(message, format);
        }
    }
}

function handleBotChannels(message, content) {
    const format = 'Possible channel options are:\n' +
        '>channel <list>\n' +
        '>channel <add> <channelId1,channelId2,channelId3>\n'+
        '>channel <remove> <channelId1,channelId2,channelId3>\n' ;
    console.log('Inside handleBotChannels,', content)
    const params = getParams(content);
    console.log('Params:', JSON.stringify(params))
    if (params.length >= 1) {
        console.log('Params greater than 1')
        const option = params[0]
        console.log('option',option)
        if (option === 'list') {
            const channelWithName = []
            channelsAllowed.forEach(channelId=>{
                const channel = getChannelById(channelId)
                if(channel){
                    channelWithName.push({
                        channelName: channel.name,
                        channelId: channel.id,
                    })
                }
            })
            const list = channelWithName.map(channel => `${channel.channelName}: ${channel.channelId}`).join('\n')
            message.reply('Allowed channels are:\n' + list)
        } else if (option === 'add') {
            const channelIdsParam = params[0]
            channelsAllowed.push.apply(channelsAllowed, channelIdsParam)
            message.reply(`${channelIdsParam} added to allowed channels`)
        } else if (option === 'remove') {
            const channelIdsParam = params[0]
            channelsAllowed = channelsAllowed.filter(function(value, index) {
                return channelIdsParam.indexOf(value) === -1;
            })
            message.reply(`${channelIdsParam} removed from allowed channels`)
        } else {
            onIncorrectParams(message, format);
        }
    } else {
        console.log('Params less than 1')
        onIncorrectParams(message, format)
    }

}

function onIncorrectParams(message, format) {
    message.reply(`Incorrect parameters.\nCorrect format is: ${format}`)
}


function isFromCurrentLoggedInUser(message) {
    return message.author.username === client.user.username;
}
