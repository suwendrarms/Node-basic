// userRoleController
const { getDatabase } = require('../database/mongo');
var validator = require('validator');

const collectionName = 'userrole';
const userRole = require("../models/userRole");
var moment = require('moment');



var name = "";
var status = false;
var validate = {};

var returnJson = {
    id: "",
    status: false,
    message: "",
    validations: validate,
};


async function createUserRole(data) {
    const database = await getDatabase();

    if (validator.isEmpty(data.name)) {
        validate.name = true;
    }

    if (Object.keys(validate).length === 0) {

        const newRole = new userRole({
            name: data.name ? data.name : '',
            status: data.status ? data.status : 0,
            createdAt: moment().format('x'),
            updatedAt: null,
        });

        var alreadyExist = await database.collection(collectionName).findOne({ name: data.name });

        if (!alreadyExist) {
            data.status = 1;
            try {
                const { insertedId } = await database.collection(collectionName).insertOne(newRole);
                returnJson.id = insertedId;
                returnJson.status = true;
                returnJson.message = "User role created successfully!";
            } catch (error) {
                returnJson.id = '';
                returnJson.status = false;
                returnJson.message = error;
            }
        } else {
            returnJson.id = '';
            returnJson.status = false;
            returnJson.message = "User role is already exits";
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

async function assignUser(data) {
    const database = await getDatabase();
    var ObjectId = require('mongodb').ObjectId;

    if (validator.isEmpty(data.id)) {
        validate.id = true;
    }

    if (validator.isEmpty(data.userRole)) {
        validate.userRole = true;
    }

    if (Object.keys(validate).length === 0) {
        try {
            var record = await database.collection('user').updateOne(
                { _id: ObjectId(data.id) },
                {
                    $set: {
                        isUserRole: data.userRole,
                    },
                },
            )

            returnJson.id = data.id;
            returnJson.status = true;
            returnJson.validations = {};
            returnJson.message = "User has been updated successfully";

        } catch (error) {
            returnJson.id = data.id;
            returnJson.status = false;
            returnJson.validations = {};
            returnJson.message = "User has not updated successfully";
        }

    } else {
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

    }

    return returnJson;
}

async function getUserRoles(data) {

    var returnJson = {
        status: false,
        message: "",
        dataSet: {},
    };

    var ObjectId = require('mongodb').ObjectId;

    console.log("data")
    console.log(data);

    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).find().toArray();

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

async function getUserRoles(data) {

    var returnJson = {
        status: false,
        message: "",
        dataSet: {},
    };

    var ObjectId = require('mongodb').ObjectId;

    console.log("data")
    console.log(data);

    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).find().toArray();

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

async function getUserRolesList(data) {

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

module.exports = {
    createUserRole,
    assignUser,
    getUserRoles,
    getUserRolesList
};