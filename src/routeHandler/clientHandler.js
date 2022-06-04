const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../schemas/userSchema");
const userRoleSchema = require("../schemas/userRoleSchema");
const clientSchema = require("../schemas/clientSchema");
const User = new mongoose.model("User", userSchema);
const Client = new mongoose.model("Client", clientSchema);
const UserRole = new mongoose.model("userRole", userRoleSchema);
var passwordHash = require('password-hash');
const checkLogin = require("../middlewares/checkLogin");
var moment = require('moment');
const jwtKey = "my_secret_key"

// SIGNUP 
router.post("/create-client", checkLogin, async (req, res) => {

    const alreadyExist = await Client.findOne({
        contactNumber: req.body.contactNumber
    });

    if (!alreadyExist) {

        try {

            const newUser = new Client({
                name: req.body.name,
                contactNumber: req.body.contactNumber,
                contactNumber2: req.body.contactNumber2,
                nic: req.body.nic,
                user: req.body.user ? req.body.user : null,
                createdAt: moment().format('x'),
                updatedAt: null,
            });

            await newUser.save();

            res.status(200).json({
                status: true,
                id: newUser._id,
                message: "Client Created successfully!",
            });
        } catch (err) {

            res.status(500).json({
                message: "Signup failed!",
                err: err,
            });
        }
    } else {

        res.status(500).json({
            message: "Contact number already exist",
            err: {}
        });
    }
});

router.post("/client-update", checkLogin, async (req, res) => {

    const alreadyExist = await Client.findOne({
        id: req.body.id
    });

    if (alreadyExist) {
        try {
            const newRecord = new Client({
                name: req.body.masterData.name,
                contactNumber: req.body.masterData.contactNumber,
                contactNumber2: req.body.masterData.contactNumber2,
                nic: req.body.masterData.nic,
                user: req.body.masterData.user ? req.body.masterData.user : null,
                createdAt: moment().format('x'),
                updatedAt: null,
            }, { _id: false });

            console.log(newRecord);


            const result = Client.findByIdAndUpdate(
                { _id: req.body.id },
                {
                    $set: newRecord
                },
                {
                    new: true,
                    useFindAndModify: false,
                },
                (err) => {
                    if (err) {
                        res.status(500).json({
                            error: "There was a server side error!",
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            id: req.body.id,
                            message: "Client has been updated successfully",
                        });
                    }
                }
            );

        } catch (err) {

            res.status(500).json({
                message: "Signup failed!",
                err: err,
            });
        }
    } else {
        res.status(500).json({
            message: "Invalid Client",
            err: {},
        });
    }

});


router.post('/get-client-list', checkLogin, async (req, res) => {

    var body = req.body;
    var filter = {};

    console.log("body");
    console.log(body);

    if (body.search) {
        filter = { $or: [{ name: { $regex: '.*' + body.search + '.*' } }, { contactNumber: { $regex: '.*' + body.search + '.*' } }, { contactNumber2: { $regex: '.*' + body.search + '.*' } }, { nic: { $regex: '.*' + body.search + '.*' } }] };
    }

    var limit = parseInt(body.limit) ? parseInt(body.limit) : 20;
    var page = parseInt(body.page) ? parseInt(body.page) : 0;
    const sort = { createdAt: 'DESC' };

    try {

        const users = await Client.find(filter).populate("user", "userName").limit(limit).skip(limit * page).sort(sort);

        var count = await Client.count(filter);
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


router.post('/get-client-details', checkLogin, async (req, res) => {

    var body = req.body;

    console.log("body");
    console.log(body);

    try {
        const user = await Client.findOne({
            _id: body.id
        });

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

router.post("/assign-call", checkLogin, async (req, res) => {

    const client = await Client.findOne({
        _id: req.body.client
    });

    const user = await User.findOne({
        _id: req.body.user
    });


    if (client) {

        if (user) {

            try {
                const newRecord = new Client({
                    user: req.body.user ? req.body.user : null,
                    updatedAt: moment().format('x'),
                }, { _id: false });

                console.log(newRecord);


                const result = Client.findByIdAndUpdate(
                    { _id: req.body.client },
                    {
                        $set: newRecord
                    },
                    {
                        new: true,
                        useFindAndModify: false,
                    },
                    (err) => {
                        if (err) {
                            res.status(500).json({
                                error: "There was a server side error!",
                            });
                        } else {
                            res.status(200).json({
                                status: true,
                                id: req.body.id,
                                message: "Client has been updated successfully",
                            });
                        }
                    }
                );

            } catch (err) {

                res.status(500).json({
                    message: "Signup failed!",
                    err: err,
                });
            }
        } else {
            res.status(500).json({
                message: "Invalid User",
                err: {},
            });
        }
    } else {
        res.status(500).json({
            message: "Invalid Client",
            err: {},
        });
    }

});

module.exports = router;
