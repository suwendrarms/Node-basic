// callsController
const { getDatabase } = require('../database/mongo');
var validator = require('validator');

const clientModel = 'client';
const callModel = 'calls';
var moment = require('moment');
var ObjectId = require('mongodb').ObjectId;

var name = "";
var status = false;
var validate = {};

var returnJson = {
    id: "",
    status: false,
    message: "",
    validations: validate,
};

async function getCallsReport(data) {

    console.log("data");
    console.log(data);

    var filter = {};

    var returnJson = {
        status: false,
        message: "",
        dataSet: [],
    };

    if (data.type) {
        filter.calledType = parseInt(data.type);
    }
    if (data.userId) {
        filter.calledAgent = data.userId;
    }
    if (data.from) {
        filter.calledAt = {
            '>=': parseInt(moment(data.from).format('x')),
            '<=': parseInt(moment(data.to).format('x'))
        };
    }

    console.log(filter);


    const database = await getDatabase();

    try {
        const sort = { createdAt: 'DESC' };

        var data = await database.collection(callModel).find(filter).sort(sort).toArray();

        console.log(data.length);


        for (let index = 0; index < data.length; index++) {

            var client = await database.collection(clientModel).findOne({ _id: ObjectId(data[index].callUserID) });
            var agent = await database.collection('user').findOne({ _id: ObjectId(data[index].calledAgent) });
            data[index].callUserID = client ? client : {};
            data[index].calledAgent = agent ? agent : {};
        }



        returnJson.status = true;
        returnJson.message = "Data found";
        returnJson.dataSet = data;

    } catch (error) {
        returnJson.status = false;
        returnJson.message = "Data not found";
        returnJson.dataSet = [];
    }

    return returnJson;
}


module.exports = {
    getCallsReport
};