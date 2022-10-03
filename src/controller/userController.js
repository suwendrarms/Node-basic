// userController
const { getDatabase } = require('../database/mongo');
var passwordHash = require('password-hash');
const jwt = require("jsonwebtoken");
var validator = require('validator');
var moment = require('moment');

const User = require("../models/users");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");


const collectionName = 'user';
const jwtKey = "my_secret_key"
const jwtExpirySeconds = 30000

var firstName = "";
var lastName = "";
var userName = "";
var email = "";
var contactNumber = "";
var password = "";
var status = false;
var validate = {};

var returnJson = {
    id: "",
    status: false,
    message: "",
    validations: validate,
};


async function insertUser(data) {

    console.log("hitsssssss");

    const database = await getDatabase();

    if (validator.isEmpty(data.firstName)) {
        validate.firstName = true;
    }
    if (validator.isEmpty(data.lastName)) {
        validate.lastName = true;
    }
    if (validator.isEmpty(data.userName)) {
        validate.userName = true;
    }
    if (validator.isEmpty(data.contactNumber)) {
        validate.contactNumber = true;
    } else if (!validator.isMobilePhone(data.contactNumber)) {
        validate.contactNumber = true;
    }
    if (validator.isEmpty(data.email)) {
        validate.email = true;
    } else if (!validator.isEmail(data.email)) {
        validate.email = true;
    }
    if (validator.isEmpty(data.password)) {
        validate.password = true;
    }

    if (Object.keys(validate).length === 0) {

        var alreadyExist = await database.collection('user').findOne({ email: data.email });
        data.createdAt = parseInt(moment().format('x'));
        data.updatedAt = '';


        if (!alreadyExist) {
            var hashedPassword = passwordHash.generate(data.password);
            data.password = hashedPassword;
            data.password = hashedPassword;
            data.status = 0;
            try {

                const newUser = new User({
                    contactNumber: data.contactNumber,
                    email: data.email,
                    firstName: data.firstName,
                    status: 0,
                    lastName: data.lastName,
                    password: data.password ? hashedPassword : '',
                    userName: data.userName,
                    nic: data.nic,
                    userRole: data.userRole ? data.userRole : null,
                    createdAt: moment().format('x'),
                    updatedAt: null,
                });

                const { insertedId } = await database.collection('user').insertOne(newUser);

                returnJson.id = insertedId;
                returnJson.status = true;
                returnJson.message = "User created successfully!";

            } catch (error) {
                console.log("error");
                console.log(error);
                returnJson.id = '';
                returnJson.status = false;
                returnJson.message = error;
            }
        } else {
            returnJson.id = '';
            returnJson.status = false;
            returnJson.message = "Email address is already taken";
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

async function getUsers(data) {

    var limit = parseInt(data.limit) ? parseInt(data.limit) : 20;
    var page = parseInt(data.page) ? parseInt(data.page) : 0;

    console.log("data");
    console.log(data);

    var returnJson = {
        status: false,
        message: "",
        dataSet: [],
    };

    const sort = { createdAt: 'DESC' };


    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).find({}).limit(limit).skip(limit * page).sort(sort)
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

async function getActiveUsers(data) {

    console.log("data");
    console.log(data);

    var returnJson = {
        status: false,
        message: "",
        dataSet: [],
    };

    const database = await getDatabase();

    try {
        var data = await database.collection(collectionName).find({ status: 1 }).toArray();

        var count = await database.collection(collectionName).count({});


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

async function getUser(data) {

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

async function activeUser(data) {
    const database = await getDatabase();
    var ObjectId = require('mongodb').ObjectId;

    if (data.id) {
        var record = await database.collection(collectionName).updateOne(
            { _id: ObjectId(data.id) },
            {
                $set: {
                    status: data.status,
                },
            },
        )
        var user = await database.collection(collectionName).findOne({ _id: ObjectId(data.id) });
        returnJson.id = data.id;
        returnJson.updatedUser = user;
        returnJson.status = true;
        returnJson.validations = {};
        returnJson.message = data.status == 1 ? "User has been activated successfully" : "User has been deactivated successfully";

    } else {
        validate.id = true;
        returnJson.id = '';
        returnJson.updatedUser = {};
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

    }

    return returnJson;
}

async function updateUser(data) {

    console.log("data.masterData");
    console.log(data.masterData);

    const database = await getDatabase();
    var ObjectId = require('mongodb').ObjectId;

    if (data.id) {

        if (data.masterData.password != '') {
            var hashedPassword = passwordHash.generate(data.masterData.password);
            const newRecord = new User({
                contactNumber: data.masterData.contactNumber,
                email: data.masterData.email,
                firstName: data.masterData.firstName,
                lastName: data.masterData.lastName,
                password: data.masterData.password ? hashedPassword : '',
                userName: data.masterData.userName,
                nic: data.masterData.nic,
                userRole: data.masterData.userRole ? data.masterData.userRole : null,
                updatedAt: moment().format('x'),
            }, { _id: false });


        } else {
            delete data.masterData.password;
        }

        console.log(data.masterData);



        console.log(newRecord);

        try {
            var record = await database.collection(collectionName).updateOne(
                { _id: ObjectId(data.id) },
                {
                    $set: newRecord,
                },
            )

            const isValidPassword = passwordHash.verify(req.body.password, user.password);

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
        validate.id = true;
        returnJson.id = '';
        returnJson.status = false;
        returnJson.message = "Required field missing!";
        returnJson.validations = validate;

    }

    return returnJson;
}


async function login(data) {
    const database = await getDatabase();

    if (!data.email) {
        validate.email = true;
    }
    if (!data.password) {
        validate.password = true;
    }

    if (Object.keys(validate).length === 0) {
        var user = await database.collection(collectionName).findOne({ email: data.email });

        console.log("user");
        console.log(user);
        if (user) {
            // console.log(passwordHash.verify("test", hashedPassword));
            if (passwordHash.verify(data.password, user.password)) {

                var email = data.email;

                const token = jwt.sign({ email }, jwtKey, {
                    algorithm: "HS256",
                    expiresIn: jwtExpirySeconds,
                })

                returnJson.id = user._id;
                returnJson.status = true;
                returnJson.message = "Sucessfully logged in";
                returnJson.validations = validate;
                returnJson.token = token;

            } else {
                returnJson.id = 'undefined';
                returnJson.status = false;
                returnJson.message = "Authentication error";
                returnJson.validations = validate;
                returnJson.token = "";

            }
        } else {
            returnJson.id = 'undefined';
            returnJson.status = false;
            returnJson.message = "Invalid User";
            returnJson.validations = validate;
        }



    } else {

    }



    return returnJson;
}



async function verifyPassword(data) {
    const database = await getDatabase();

    if (!data.password) {
        validate.password = true;
    }

    if (Object.keys(validate).length === 0) {
        var user = await database.collection(collectionName).findOne({ email: data.email });

        if (user) {
            // console.log(passwordHash.verify("test", hashedPassword));
            if (passwordHash.verify(data.password, user.password)) {

                returnJson.id = user._id;
                returnJson.status = true;
                returnJson.message = "Sucessfully verified";
                returnJson.validations = validate;

            } else {
                returnJson.id = 'undefined';
                returnJson.status = false;
                returnJson.message = "Authentication error";
                returnJson.validations = validate;

            }
        } else {
            returnJson.id = 'undefined';
            returnJson.status = false;
            returnJson.message = "Invalid User";
            returnJson.validations = validate;
        }



    } else {

    }



    return returnJson;
}


module.exports = {
    insertUser,
    getUsers,
    getUser,
    login,
    activeUser,
    updateUser,
    verifyPassword,
    getActiveUsers
};