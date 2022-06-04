// callsController
const { getDatabase } = require('../database/mongo');
var validator = require('validator');

const collectionName = 'client';
const callModel = 'calls';
var moment = require('moment');
const Client = require("../models/client");
const Call = require("../models/call");
const mongoose = require("mongoose");


var name = "";
var status = false;
var validate = {};

var returnJson = {
    id: "",
    status: false,
    message: "",
    validations: validate,
};


async function createClient(data) {
    const database = await getDatabase();

    if (validator.isEmpty(data.contactNumber)) {
        validate.contactNumber = true;
    } else if (!validator.isMobilePhone(data.contactNumber)) {
        validate.contactNumber = true;
    }

    if (Object.keys(validate).length === 0) {

        const newClient = new Client({
            name: data.name,
            contactNumber: data.contactNumber,
            contactNumber2: data.contactNumber2,
            nic: data.nic,
            user: data.user ? data.user : null,
            createdAt: moment().format('x'),
            updatedAt: null,
        });

        var alreadyExist = await database.collection(collectionName).findOne({ contactNumber: data.contactNumber });

        if (!alreadyExist) {
            data.createdAt = parseInt(moment().format('x'));
            data.updatedAt = '';

            try {
                const { insertedId } = await database.collection(collectionName).insertOne(newClient);
                returnJson.id = insertedId;
                returnJson.status = true;
                returnJson.message = "Call created successfully!";
            } catch (error) {
                returnJson.id = '';
                returnJson.status = false;
                returnJson.message = error;
            }
        } else {
            returnJson.id = '';
            returnJson.status = false;
            returnJson.message = "Contact number is already exits";
            returnJson.validations = validate;
        }

        return returnJson;

    } else {
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

        return returnJson;
    }

}

async function createCall(data) {
    const database = await getDatabase();

    if (validator.isEmpty(data.dataSet.callUserID)) {
        validate.callUserID = true;
    } else if (validator.isEmpty(data.dataSet.calledAgent)) {
        validate.calledAgent = true;
    }

    if (Object.keys(validate).length === 0) {

        const newRecord = new Call({
            calledNumber: data.dataSet.calledNumber,
            calledDate: data.dataSet.calledDate,
            calledDuration: data.dataSet.calledDuration,
            calledType: data.dataSet.calledType,
            callUserID: data.dataSet.callUserID ? data.dataSet.callUserID : null,
            calledAgent: data.dataSet.calledAgent ? data.dataSet.calledAgent : null,
            calledType: data.dataSet.calledType,
            status: data.dataSet.status,
            createdAt: moment().format('x'),
        });

        data.dataSet.createdAt = parseInt(moment().format('x'));
        data.dataSet.updatedAt = '';

        try {
            const { insertedId } = await database.collection(callModel).insertOne(newRecord);
            returnJson.id = insertedId;
            returnJson.status = true;
            returnJson.message = "Call created successfully!";
        } catch (error) {
            returnJson.id = '';
            returnJson.status = false;
            returnJson.message = error;
        }


        return returnJson;

    } else {
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

        return returnJson;
    }

}

async function assignCall(data) {
    const database = await getDatabase();
    var ObjectId = require('mongodb').ObjectId;

    if (validator.isEmpty(data.user)) {
        validate.user = true;
    }

    if (validator.isEmpty(data.client)) {
        validate.client = true;
    }

    console.log("validate");
    console.log(validate);

    if (Object.keys(validate).length === 0) {

        var call = await database.collection('calls').findOne({ _id: ObjectId(data.call) });
        var user = await database.collection('user').findOne({ _id: ObjectId(data.user) });

        console.log("call");
        console.log(call);
        console.log("user");
        console.log(user);

        try {

            if (call) {

                if (user) {

                    var record = await database.collection('calls').updateOne(
                        { _id: ObjectId(data.id) },
                        {
                            $set: {
                                user: data.user,
                            },
                        },
                    )

                    returnJson.id = data.id;
                    returnJson.status = true;
                    returnJson.validations = {};
                    returnJson.message = "Call has been assigned successfully";

                } else {
                    returnJson.id = data.id;
                    returnJson.status = true;
                    returnJson.validations = {};
                    returnJson.message = "No user with this id";
                }

            } else {
                returnJson.id = data.id;
                returnJson.status = true;
                returnJson.validations = {};
                returnJson.message = "No call with this id";
            }

        } catch (error) {
            returnJson.id = data.id;
            returnJson.status = false;
            returnJson.validations = {};
            returnJson.message = "Call has not assigned successfully";
        }

    } else {
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

    }

    return returnJson;
}

async function getClients(data) {

    var limit = parseInt(data.limit) ? parseInt(data.limit) : 20;
    var page = parseInt(data.page) ? parseInt(data.page) : 0;

    console.log("data");
    console.log(data);

    var returnJson = {
        status: false,
        message: "",
        dataSet: [],
    };

    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).find({}).limit(limit).skip(limit * page)
            .toArray();

        var count = await database.collection(collectionName).count({});
        var numberOfPages = Math.round(count / limit);


        returnJson.status = true;
        returnJson.message = "Data found";
        returnJson.page = page;
        returnJson.limit = limit;
        returnJson.numberOfPages = numberOfPages;
        returnJson.dataSet = data;

    } catch (error) {
        returnJson.status = false;
        returnJson.message = "Data not found";
        returnJson.dataSet = [];
    }


    return returnJson;
}

async function getCalls(data) {

    var limit = parseInt(data.limit) ? parseInt(data.limit) : 20;
    var page = parseInt(data.page) ? parseInt(data.page) : 0;

    const database = await getDatabase();

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

    // const database = await getDatabase();

    try {
        const sort = { createdAt: 'DESC' };

        var data = await database.collection(callModel).find(filter).populate('callUserID').limit(limit).skip(limit * page).sort(sort).toArray();

        console.log("data");
        console.log(data);

        var count = await database.collection(callModel).count(filter);
        var numberOfPages = Math.round(count / limit);


        returnJson.status = true;
        returnJson.message = "Data found";
        returnJson.page = page;
        returnJson.limit = limit;
        returnJson.numberOfPages = numberOfPages;
        returnJson.dataSet = data;

    } catch (error) {
        returnJson.status = false;
        returnJson.message = "Data not found";
        returnJson.dataSet = [];
    }


    return returnJson;
}

async function updateClient(data) {

    console.log("data.masterData");
    console.log(data.masterData);

    const database = await getDatabase();
    var ObjectId = require('mongodb').ObjectId;

    if (data.id) {

        if (data.masterData.user != '') {
            data.masterData.user = data.masterData.user;
        } else {
            delete data.masterData.user;
        }

        console.log(data.masterData);
        data.masterData.updatedAt = parseInt(moment().format('x'));


        const newClient = new Client({
            name: data.masterData.name,
            contactNumber: data.masterData.contactNumber,
            contactNumber2: data.masterData.contactNumber2,
            nic: data.masterData.nic,
            user: data.masterData.user ? data.masterData.user : null,
            createdAt: moment().format('x'),
            updatedAt: null,
        }, { _id: false });

        try {
            var record = await database.collection(collectionName).updateOne(
                { _id: ObjectId(data.id) },
                {
                    $set: newClient,
                },
            )

            returnJson.id = data.id;
            returnJson.status = true;
            returnJson.validations = {};
            returnJson.message = "Client has been updated successfully";

        } catch (error) {
            returnJson.id = data.id;
            returnJson.status = false;
            returnJson.validations = {};
            returnJson.message = "Client has not updated successfully";
        }

    } else {
        validate.id = true;
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

    }

    return returnJson;
}

async function uploadCsv(data) {
    const database = await getDatabase();

    console.log(data.file.length);
    console.log(data.userId);

    var returnJson = {
        status: false,
        message: "",
        dataSet: {},
    };

    var prmiseStatus = false;

    try {

        for (let index = 0; index < data.file.length; index++) {

            var alreadyExist = await database.collection(collectionName).findOne({ nic: data.file[index].clientnic });

            if (!alreadyExist) {

                const newClient = new Client({
                    name: data.file[index].clientname,
                    contactNumber: data.file[index].clientcontact1,
                    contactNumber2: data.file[index].clientcontact2 ? data.file[index].clientcontact2 : '',
                    nic: data.file[index].clientnic,
                    user: data.userId ? data.userId : null,
                    createdAt: moment().format('x'),
                    updatedAt: null,
                });

                const { insertedId } = await database.collection(collectionName).insertOne(newClient);


                console.log("insertedId");
                console.log(insertedId);

                if (insertedId) {

                    const newCall = new Call({
                        calledDate: '',
                        calledDuration: '',
                        calledType: 0,
                        status: 0,
                        callUserID: insertedId ? insertedId : null,
                        calledNumber: data.contactNumber ? data.contactNumber : data.contactNumber2,
                        calledAgent: data.userId ? data.userId : null,
                        createdAt: moment().format('x'),
                        updatedAt: null,
                    });

                    const record = await database.collection(callModel).insertOne(newCall);

                }

            } else {
                // if (alreadyExist) {

                const newCall = new Call({
                    calledDate: '',
                    calledDuration: '',
                    calledType: 0,
                    status: 0,
                    callUserID: alreadyExist ? alreadyExist._id : null,
                    calledAgent: data.userId ? data.userId : null,
                    calledNumber: alreadyExist.contactNumber ? alreadyExist.contactNumber : alreadyExist.contactNumber2,
                    createdAt: moment().format('x'),
                    updatedAt: null,
                });

                const record = await database.collection(callModel).insertOne(newCall);

                // }
            }




        }

        returnJson.status = true;
        returnJson.message = data.file.length + " calls assigned sucessfully";

    } catch (error) {
        returnJson.status = false;
        returnJson.message = error;
    }

    return returnJson;

}

async function getClient(data) {

    var returnJson = {
        status: false,
        message: "",
        dataSet: {},
    };

    var ObjectId = require('mongodb').ObjectId;

    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).findOne({ _id: ObjectId(data.id) });

        returnJson.status = true;
        returnJson.message = "Data found";
        returnJson.dataSet = data;

    } catch (error) {
        returnJson.status = false;
        returnJson.message = "Data not found";
        returnJson.dataSet = {};
    }


    return returnJson;
}

async function getCall(data) {

    var returnJson = {
        status: false,
        message: "",
        dataSet: {},
    };

    var ObjectId = require('mongodb').ObjectId;

    const database = await getDatabase();

    try {
        var data = await database.collection(callModel).findOne({ _id: ObjectId(data.id) });
        var client = await database.collection('client').findOne({ _id: ObjectId(data.callUserID) });
        var agent = await database.collection('user').findOne({ _id: ObjectId(data.calledAgent) });



        returnJson.status = true;
        returnJson.message = "Data found";
        returnJson.dataSet.callData = data ? data : {};
        returnJson.dataSet.callUser = client ? client : {};
        returnJson.dataSet.agent = agent ? agent : {};

    } catch (error) {
        returnJson.status = false;
        returnJson.message = "Data not found";
        returnJson.dataSet = {};
    }


    return returnJson;
}


module.exports = {
    createClient,
    assignCall,
    getClients,
    updateClient,
    uploadCsv,
    getClient,
    createCall,
    getCalls,
    getCall
};