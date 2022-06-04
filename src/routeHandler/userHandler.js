const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../schemas/userSchema");
const userRoleSchema = require("../schemas/userRoleSchema");
const User = new mongoose.model("User", userSchema);
const UserRole = new mongoose.model("userRole", userRoleSchema);
var passwordHash = require('password-hash');
const checkLogin = require("../middlewares/checkLogin");
var moment = require('moment');
const jwtKey = "my_secret_key"

// SIGNUP 
router.post("/create-user", checkLogin, async (req, res) => {

    try {
        // const hashedPassword = await bcrypt.hash(req.body.password, 10);
        var hashedPassword = passwordHash.generate(req.body.password);

        const newUser = new User({
            contactNumber: req.body.contactNumber,
            email: req.body.email,
            firstName: req.body.firstName,
            nic: req.body.nic,
            lastName: req.body.lastName,
            userName: req.body.userName,
            status: 0,
            userRole: req.body.userRole ? req.body.userRole : null,
            createdAt: moment().format('x'),
            updatedAt: null,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(200).json({
            status: true,
            id: newUser._id,
            message: "User Created successfully!",
        });
    } catch (err) {

        res.status(500).json({
            message: "Signup failed!",
            err: err,
        });
    }
});

router.post("/user-update", checkLogin, async (req, res) => {

    try {
        if (req.body.masterData.password) {
            const newRecord = new User({
                contactNumber: req.body.masterData.contactNumber,
                email: req.body.masterData.email,
                firstName: req.body.masterData.firstName,
                lastName: req.body.masterData.lastName,
                password: req.body.masterData.password ? passwordHash.generate(req.body.masterData.password) : '',
                userName: req.body.masterData.userName,
                nic: req.body.masterData.nic,
                userRole: req.body.masterData.userRole ? req.body.masterData.userRole : null,
                updatedAt: moment().format('x'),
            }, { _id: false });

            console.log(newRecord);


            const result = User.findByIdAndUpdate(
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
                            message: "User has been updated successfully",
                        });
                    }
                }
            );
        } else {

            const newRecord = new User({
                contactNumber: req.body.masterData.contactNumber,
                email: req.body.masterData.email,
                firstName: req.body.masterData.firstName,
                lastName: req.body.masterData.lastName,
                userName: req.body.masterData.userName,
                nic: req.body.masterData.nic,
                userRole: req.body.masterData.userRole ? req.body.masterData.userRole : null,
                updatedAt: moment().format('x'),
            }, { _id: false });

            console.log(newRecord);

            const result = User.findByIdAndUpdate(
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
                            message: "User has been updated successfully",
                        });
                    }
                }
            );
        }

    } catch (err) {

        res.status(500).json({
            message: "Signup failed!",
            err: err,
        });
    }

});

router.post('/verify-password', checkLogin, async (req, res) => {

    var body = req.body;

    try {
        const user = await User.findOne({
            email: body.email
        });

        const isValidPassword = passwordHash.verify(body.password, user.password);

        if (isValidPassword) {
            res.status(200).json({
                status: true,
                dataSet: user,
                message: "Password verified"
            });
        } else {
            res.status(200).json({
                status: false,
                dataSet: {},
                message: "Invalid password"
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

// LOGIN
router.post("/login", async (req, res) => {

    console.log(req.body);
    try {

        var filter = {};

        if(req.body.type == 1){
            filter.email = req.body.email;
            filter.userRole = '6274e9e8a97eb61e80ba8036';
        }else{
            filter.email = req.body.email;
        }
        const user = await User.findOne(filter);
        // const user = await User.findOne({ email: req.body.email }, function (err, obj) { console.log("obj"); console.log(obj); console.log("err"); console.log(err); });

        console.log("user");
        console.log(user);

        if (user) {

            const isValidPassword = passwordHash.verify(req.body.password, user.password);

            if (passwordHash.verify(req.body.password, user.password)) {
                // generate token
                const token = jwt.sign({
                    username: user.email,
                    userId: user._id,
                }, jwtKey, {
                    expiresIn: '1h'
                });

                res.status(200).json({
                    "id": user._id,
                    "status": true,
                    "message": "Login successful!",
                    "token": token

                });
            } else {
                res.status(401).json({
                    "error": "Authetication failed!"
                });
            }
        } else {
            res.status(401).json({
                "status": false,
                "error": "Authetication failed!"
            });
        }
    } catch {
        res.status(401).json({
            "status": false,
            "error": "Authetication failed!"
        });
    }
});

// GET ALL USERS
router.get('/all', async (req, res) => {
    try {
        const users = await User.find({
            status: 'active'
        }).populate("todos");

        res.status(200).json({
            data: users,
            message: "Success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "There was an error on the server side!"
        });
    }
});

router.post('/get-users', checkLogin, async (req, res) => {

    var body = req.body;
    var filter = {};

    var limit = parseInt(body.limit) ? parseInt(body.limit) : 20;
    var page = parseInt(body.page) ? parseInt(body.page) : 0;

    if (body.search) {
        filter = {$or : [{ userName : { $regex: '.*' + body.search + '.*' }}, {firstName : { $regex: '.*' + body.search + '.*' }}, {lastName :  { $regex: '.*' + body.search + '.*' }}, {email :  { $regex: '.*' + body.search + '.*' }}, {nic : { $regex: '.*' + body.search + '.*'}}]};
    }

    console.log(filter);

    const sort = { createdAt: 'DESC' };


    try {

        const users = await User.find(filter).populate("userRole", "name").limit(limit).skip(limit * page).sort(sort);

        var count = await User.count(filter);
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

router.get('/get-active-users', checkLogin, async (req, res) => {

    var body = req.body;

    const sort = { createdAt: 'DESC' };

    try {

        const users = await User.find({ status: 1 }).populate("userRole", "name").sort(sort);

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

router.post('/get-user-role-list', checkLogin, async (req, res) => {

    var body = req.body;

    var limit = parseInt(body.limit) ? parseInt(body.limit) : 20;
    var page = parseInt(body.page) ? parseInt(body.page) : 0;
    const sort = { createdAt: 'DESC' };


    try {

        const userRoles = await UserRole.find().limit(limit).skip(limit * page).sort(sort);

        var count = await UserRole.count();
        var numberOfPages = Math.round(count / limit);

        res.status(200).json({
            status: true,
            page: page,
            limit: limit,
            numberOfPages: numberOfPages,
            dataSet: userRoles,
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

router.get('/get-user-roles', checkLogin, async (req, res) => {

    var body = req.body;
    const sort = { createdAt: 'DESC' };
    try {

        const userRoles = await UserRole.find().sort(sort);

        res.status(200).json({
            status: true,
            dataSet: userRoles,
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

router.post('/get-user-details', checkLogin, async (req, res) => {

    var body = req.body;

    try {
        const user = await User.findOne({
            _id: body.id
        });


        res.status(200).json({
            status: true,
            dataSet: user,
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

router.post("/create-user-role", checkLogin, async (req, res) => {

    try {

        const newUserRole = new UserRole({
            name: req.body.name,
            status: 0,
            createdAt: moment().format('x'),
            updatedAt: null,
        });

        var data = await newUserRole.save();

        res.status(200).json({
            status: true,
            id: newUserRole._id,
            message: "User Role Created successfully!",
        });
    } catch (err) {

        res.status(500).json({
            message: "Signup failed!",
            err: err,
        });
    }
});

router.post("/user-status-change", checkLogin, async (req, res) => {

    try {

        const result = User.findByIdAndUpdate(
            { _id: req.body.id },
            {
                $set: {
                    status: req.body.status,
                },
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
                        message: req.body.status == 1 ? "User was activated successfully!" : "User was de-activated successfully!",
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
});

module.exports = router;
