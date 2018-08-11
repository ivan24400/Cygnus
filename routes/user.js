var express = require('express');
var db = require('../model/cygnus');
var multer = require('multer');
var hash_sha256 = require("crypto-js/sha256");

var multer_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/avatar');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.substring(file.originalname.lastIndexOf('.')));
    }
});
var upload = multer({ storage: multer_storage });

var router = express.Router();

router.get('/', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    res.render('user', { username: req.session.username, navlogin: true });
});

router.get('/contact', function (req, res, next) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    res.render('user/contact', { c_id: req.query.id, username: req.session.username });
});

router.post('/contact', upload.single('file'), function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    console.log(req.body);
    console.log(req.file);
    var pic = null;
    if (typeof req.file !== 'undefined') {
        pic = req.file.filename;
    }
    db.updateContact(parseInt(req.body.c_id), req.body.c_firstname, req.body.c_lastname, pic, req.body.c_dob, req.body.c_group, req.body.c_address, req.body.c_phone_no, req.body.c_phone_type, req.body.c_email, req.body.c_email_type, function (err) {
        if (err != null) {
            res.render('/error');
        } else {
            res.redirect('/user');
        }
    });
});

router.get('/add_contact', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    res.render('user/add_contact', { username: req.session.username });
});

router.post('/add_contact', upload.single('file'), function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    var pic = null;
    if (req.file !== undefined) {
        pic = req.file.filename;
    }
    if (req.body.c_email === '') {
        req.body.c_email_type = '';
    }
    if (req.body.c_phone_no === '') {
        req.body.c_phone_type = '';
    }

    db.addContact(req.session.user, req.body.c_firstname, req.body.c_lastname, pic, req.body.c_dob, req.body.c_group, req.body.c_address, req.body.c_phone_no, req.body.c_phone_type, req.body.c_email, req.body.c_email_type, function (err) {
        if (err) throw err;
        res.redirect('/user');
    });

});

router.get('/profile', function (req, res, next) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    res.render('user/profile', { username: req.session.username });
});

router.post('/profile', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    var password = req.body.ep_password;
    if (!password.length) {
        paswword = null;
    } else {
        password = hash_sha256(req.body.ep_password).toString();
    }
    db.updateUser(req.body.ep_firstname, req.body.ep_lastname, req.body.ep_gender, req.body.ep_dob, req.session.user, password, function (err) {
        console.log(err);
        if (err) res.status(500).send('User update failed');
        return;
    });
    res.redirect('/user');
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

/**
 * REST API
 */
router.get('/api/v1/user/profile', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    db.getUserProfile(req.session.user, function (result) {
        res.send(result);
    });
});

router.get('/api/v1/contacts', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }

    if (!req.query.id) {
        db.getAllContacts(req.session.user, function (result) {
            res.send(result);
        });
    } else {
        db.getContact(req.query.id, function (result) {
            if (result == null) {
                res.status(200).send({});
            } else {
                if (result.c_pic != null) {
                    result.c_pic = '/images/avatar/' + result.c_pic;
                }
                res.send(result);
            }
        });
    }
});

router.delete('/api/v1/contacts', function (req, res) {
    if (!req.session.username) {
        res.redirect('/'); return;
    }
    db.deleteContacts(req.body.contacts, function (err) {
        if (err) {
            res.send({});
        } else {
            res.send({ msg: 'delete success' });
        }
    });
});


module.exports = router;