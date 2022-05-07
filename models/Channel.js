const mongoose = require('mongoose');
//Define a schema
const Schema = mongoose.Schema;

const channelSchema = new Schema({
    _id: String,
    addedByUserId: String,
    allowedChannels: [String]
});

module.exports = mongoose.model('AllowedChannel', channelSchema);

