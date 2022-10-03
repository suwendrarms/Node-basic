const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../schemas/userSchema");
const userRoleSchema = require("../schemas/userRoleSchema");
const clientSchema = require("../schemas/clientSchema");
const callSchema = require("../schemas/callSchema");
const User = new mongoose.model("User", userSchema);
const Client = new mongoose.model("Client", clientSchema);
const Call = new mongoose.model("Call", callSchema);
const UserRole = new mongoose.model("userRole", userRoleSchema);
var passwordHash = require('password-hash');
const checkLogin = require("../middlewares/checkLogin");
var moment = require('moment');
const jwtKey = "my_secret_key"

router.post("/create-call", checkLogin, async (req, res) => {

    try {

        const newRecord = new Call({
            calledDate: req.body.calledDate,
            status: req.body.status,
            calledNumber: req.body.calledNumber,
            calledDuration: req.body.calledDuration,
            calledType: req.body.calledType,
            calledAt: req.body.calledAt,
            calledAgent: req.body.calledAgent,
            callUserID: req.body.callUserID ? req.body.callUserID : null,
            createdAt: moment().format('x'),
            updatedAt: null,
        });

        await newRecord.save();

        res.status(200).json({
            status: true,
            id: newRecord._id,
            message: "Call Created successfully!",
        });
    } catch (err) {

        res.status(500).json({
            message: "Signup failed!",
            err: err,
        });
    }
});

router.post('/get-call-list', checkLogin, async (req, res) => {

    var body = req.body;
    var filter = {}

    if (body.type) {
        filter.calledType = body.type
    }

    if (body.userId) {
        filter.calledAgent = body.userId
    }

    if (body.status) {
        filter.status = body.status
    }


    console.log("filter");
    console.log(filter);

    var limit = parseInt(body.limit) ? parseInt(body.limit) : 20;
    var page = parseInt(body.page) ? parseInt(body.page) : 0;
    const sort = { createdAt: 'DESC' };

    try {

        const users = await Call.find(filter).populate("calledAgent", "userName").populate("callUserID", "name").limit(limit).skip(limit * page).sort(sort);

        var count = await Call.count(filter);
        var numberOfPages = Math.round(count / limit);

        res.status(200).json({
            status: true,
            page: page,
            limit: limit,
            numberOfPages: numberOfPages,
            dataSet: users,
            message: "Data found"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            message: "There was an error on the server side!"
        });
    }
});

router.post('/get-call-details', checkLogin, async (req, res) => {

    var body = req.body;

    try {
        const user = await Call.findOne({
            _id: body.id
        }).populate("calledAgent", "userName").populate("callUserID", "name");

        if (user) {

            res.status(200).json({
                status: true,
                dataSet: user,
                message: "Data found"
            });
        } else {

            res.status(200).json({
                status: false,
                dataSet: {},
                message: "Data not found"
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            message: "There was an error on the server side!"
        });
    }
});

router.post("/upload-csv", checkLogin, async (req, res) => {

    var body = req.body;
    var dataArr = req.body.file;

    try {

        for (let index = 0; index < dataArr.length; index++) {

            const alreadyExist = await Client.findOne({
                nic: dataArr[index].clientnic
            });

            if (!alreadyExist) {

                const newRcord = new Client({
                    name: dataArr[index].clientname,
                    contactNumber: dataArr[index].contactnumber1,
                    contactNumber2: dataArr[index].contactnumber2 ? dataArr[index].contactnumber2 : '',
                    nic: dataArr[index].clientnic,
                    user: body.user ? body.user : null,
                    createdAt: moment().format('x'),
                    updatedAt: null,
                });

                var record = await newRcord.save();

                if (record) {

                    const newCall = new Call({
                        calledDate: "",
                        status: 0,
                        calledNumber: record.contactNumber,
                        calledDuration: "",
                        calledType: 0,
                        calledAt: null,
                        calledAgent: body.userId ? body.userId : null,
                        callUserID: record._id,
                        createdAt: moment().format('x'),
                        updatedAt: null,
                    });

                    await newCall.save();
                }


            } else {

                const newCall = new Call({
                    calledDate: "",
                    status: 0,
                    calledNumber: dataArr[index].contactnumber1,
                    calledDuration: "",
                    calledType: 0,
                    calledAt: null,
                    calledAgent: body.userId ? body.userId : null,
                    callUserID: alreadyExist._id,
                    createdAt: moment().format('x'),
                    updatedAt: null,
                });

                await newCall.save();

            }

        }
        res.status(200).json({
            status: true,
            err: {},
            message: "File uploaded successfully!",
        });

    } catch (error) {

        res.status(200).json({
            status: true,
            err: error,
            message: "File not uploaded!",
        });

    }










});

router.post('/call-log-report', checkLogin, async (req, res) => {

    var body = req.body;
    var filter = {}

    if (body.type) {
        filter.calledType = body.type
    }

    if (body.userId) {
        filter.calledAgent = body.userId
    }

    if (body.status) {
        filter.status = body.status
    }


    if (body.from || body.to) {
        var fromStamp = moment(body.from).format();
        var toStamp = moment(body.to).format();

        filter.createdAt = {
            $gte: parseInt(moment(fromStamp).format('x')),
            $lte: parseInt(moment(toStamp).format('x'))
        };
    }

    if (Object.keys(filter).length === 0) {

        var startOf = parseInt(moment().startOf('month').format('x')); 
        var endOf = parseInt(moment().endOf('month').format('x')); 

        filter.createdAt = {
            $gte: parseInt(moment(startOf).format('x')),
            $lte: parseInt(moment(endOf).format('x'))
        };

    }

    const sort = { createdAt: 'DESC' };

    try {

        const users = await Call.find(filter).populate("calledAgent", "userName").populate("callUserID", "name").sort(sort);

        res.status(200).json({
            status: true,
            dataSet: users,
            message: "Data found"
        });

    } catch (err) {

        console.log(err);
        res.status(500).json({
            status: false,
            message: "There was an error on the server side!"
        });

    }
});


module.exports = router;
