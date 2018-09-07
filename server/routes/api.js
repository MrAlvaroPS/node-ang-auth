const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require ('../models/user');

const mongoose = require('mongoose');

const db = 'mongodb://51.255.223.127:27018';


mongoose.connect(db, err => {
    if (err) {
        console.log(err);
    } else {
        console.log('connected to DDBB');
    }
});

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request');
    }

    let token = req.headers.authorization.split(' ')[1];

    if(token === 'null') {
        return res.status(401).send('Unauthorized request');
    }

    let payload = jwt.verify(token, 'secretKey');

    if(!payload) {
        return res.status(401).send('Unauthorized request');
    }

    req.userId = payload.subject;
    next();
}

router.get('/', (req, res, next) => {
    res.send('from API route');
});

router.post('/register', (req, res) => {
    let userData = req.body;
    let user = new User(userData);

    user.save((error, registeredUser) => {
        if(error) {
            console.log(error)
        } else {
            let payload = { subjetct: registeredUser._id };
            let token = jwt.sign(payload, 'secretKey');
            res.status(200).send({token});
        }
    });
});

router.post('/login', (req, res) => {
    let userData = req.body;
   
    User.findOne({email: userData.email}, (error, user) => {
        if(error) {
            console.log(error);
        } else {
            if(!user) {
                res.status(401).send('Invalid email');
            } else if (user.password !== userData.password) {
                res.status(401).send('invalid password');
            } else {
                let payload = { subject: user._id };
                let token = jwt.sign(payload, 'secretKey');
                res.status(200).send({token});
            }
        }
    });
});


router.get('/index', verifyToken, (req, res) => {
    res.send('estas en la pestaña de prueba');
});

module.exports = router;