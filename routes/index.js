var express = require('express');
var db = require('../model/cygnus');
var hash_sha256 = require("crypto-js/sha256");

var router = express.Router();

router.get('/', function (req, res, next) {
    if (!req.session.error && req.session.error != null) {
        res.redirect('user');
    } else{
        res.render('index', { error: req.session.error });
        req.session.error = null;
    }
});

router.post('/', function (req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    console.log("username:" + name);
    console.log("password:" + pass);

    db.checkUser(name, function (result) {
        console.log(result);
        if (typeof result !== 'undefined') {
            pass = hash_sha256(pass).toString();
            if (name !== result.user || pass !== result.passwd) {
                req.session.error = true;
                console.log("mismatch occurred");
                res.redirect('/');
            } else {
                req.session.user = name;
                req.session.password = pass;
                req.session.username = name.split('@')[0];
                req.session.error = false;
                console.log("no error");
                res.redirect('user');
            }
        } else {
            req.session.error = true;
            res.redirect('/');
        }
    });
});

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.get('/contactus', function (req, res, next) {
    res.render('contactus');
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', function (req, res) {
    db.createUser(req.body.su_email, hash_sha256(req.body.su_password).toString(), req.body.su_firstname, req.body.su_lastname, req.body.su_gender, req.body.su_dob, function (err) {
        if (err) {
            console.log(err);
            res.render('signup', { error: "Email already registered!"} );
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
