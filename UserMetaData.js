const mongoose = require('mongoose');
//Define a schema
const Schema = mongoose.Schema;

const userMetaDataSchema = new Schema({
    _id: String,
    userID: String,
    repliedByUserID: String,
    timeInMillis: {type: Date, default: Date.now}
});

module.exports = mongoose.model('UserMetaData', userMetaDataSchema);

