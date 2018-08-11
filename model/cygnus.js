var dbcon = require('../services/db');

module.exports = {

    /**
     * Check if user exists or not.
     * @param username name of user to be checked.
     * @param proc callback to process result of type array
     */
    checkUser: function (username, proc) {
        dbcon.query("call get_user_login(?);", [username], function (err, result) {
            if (err) throw err;
            proc(result[0][0]);
        });
    },

    /**
     * Creates/Registers a new user
     * @param proc callback to handle error
     */
    createUser: function (username, passwd, firstname, lastname, gender, dob, proc) {
        dbcon.query("call create_user(?,?,?,?,?,?);", [username, passwd, firstname, lastname, gender, dob], function (err, result) {
            proc(err);
        });
    },

    /**
     * Update user profile
     * @param username user to be updated
     * @param proc callback to handle error
     */
    updateUser: function (firstname, lastname, gender, dob, username, passwd, proc) {
        dbcon.query("call update_user(?,?,?,?,?,?);", [username, passwd, firstname, lastname, gender, dob], function (err, result) {
            if (err) {
                proc(err);
            } else {
                proc(null);
            }
        });
    },

    /** 
     * Retrieves user details
     * @param username profile of username
     * @param proc callback to process result of type array
     */
    getUserProfile: function (username, proc) {
        dbcon.query("call get_user_profile(?);", [username], function (err, result) {
            if (err) throw err;
            proc(result[0]);
        });
    },

    /**
     * Update a contact
     * @param proc call back to handle errors
     */
    updateContact: function (cid, firstname, lastname, pic, dob, group, address, phone, phone_t, email, email_t, proc) {

        if (typeof pic === 'undefined' || pic === '') {
            pic = null;
        }
        if (typeof lastname === 'undefined' || lastname === '') {
            lastname = null;
        }
        if (typeof dob === 'undefined' || dob === '') {
            dob = null;
        }
        if (typeof address === 'undefined' || address === '') {
            address = null;
        }

        if (typeof phone === 'undefined' || phone.length === 0) {
            phone = null;
        }
        if (typeof email === 'undefined' || email.length === 0) {
            email = null;
        }
        dbcon.query("call update_contact(?,?,?,?,?,?,?);", [cid, firstname, lastname, pic, dob, group, address], function (err, result) {
            if (err) { proc(err); return }
            if (phone != null) {
                dbcon.query('call rem_old_phone_numbers(?);', [cid], function (err, result, fields) {
                    if (err) { proc(err); return }
                    if (phone.constructor === Array) {
                        for (var i = 0; i < phone.length; i++) {
                            dbcon.query('call create_phone_number(?,?,?);', [cid, phone_t[i], phone[i]], function (err, result, fields) {
                                if (err) { proc(err); return }
                            });
                        }
                    } else {
                        dbcon.query('call create_phone_number(?,?,?);', [cid, phone_t, phone], function (err, result, fields) {
                            if (err) { proc(err); return; }
                        });
                    }
                });
            }
            if (email != null) {
                dbcon.query('call rem_old_emails(?);', [cid], function (err, result, fields) {
                    if (err) proc(err);
                    if (email.constructor === Array) {
                        for (var i = 0; i < email.length; i++) {
                            dbcon.query('call create_email(?,?,?);', [cid, email_t[i], email[i]], function (err, result, fields) {
                                if (err) proc(err);
                            });
                        }
                    } else {
                        dbcon.query('call create_email(?,?,?);', [cid, email_t, email], function (err, result, fields) {
                            if (err) proc(err);
                        });
                    }
                });
            }
            proc(null);
        });
    },

    /**
     * Add contact
     * @param proc callback to handle errors
     */
    addContact: function (username, firstname, lastname, pic, dob, group, address, phone, phone_t, email, email_t, proc) {
        if (typeof pic == 'undefined' || pic === '') {
            pic = null;
        }
        if (typeof lastname == 'undefined' || lastname === '') {
            lastname = null;
        }
        if (typeof dob == 'undefined' || dob === '') {
            dob = null;
        }
        if (typeof address == 'undefined' || address === '') {
            address = null;
        }
        dbcon.query('call create_contact(?,?,?,?,?,?,?,@insertId); select @insertId;', [username, firstname, lastname, pic, dob, group, address], function (err, result, field) {
            if (err) proc(err);

            var c_id = result[1][0]['@insertId'];
            if (c_id == 0) {
                return;
            }

            if (typeof phone !== 'undefined' && phone !== '') {
                dbcon.query('call rem_old_phone_numbers(?);', [c_id], function (err, result, fields) {
                    if (err) proc(err);
                    if (phone.constructor === Array) {
                        for (var i = 0; i < phone.length; i++) {
                            dbcon.query('call create_phone_number(?,?,?);', [c_id, phone_t[i], phone[i]], function (err, result, fields) {
                                if (err) proc(err);
                            });
                        }
                    } else {
                        dbcon.query('call create_phone_number(?,?,?);', [c_id, phone_t, phone], function (err, result, fields) {
                            if (err) proc(err);
                        });
                    }
                });
            }
            if (typeof email !== 'undefined' && email !== '') {
                dbcon.query('call rem_old_emails(?);', [c_id], function (err, result, fields) {
                    if (err) throw err;
                    if (email.constructor === Array) {
                        for (var i = 0; i < email.length; i++) {
                            dbcon.query('call create_email(?,?,?);', [c_id, email_t[i], email[i]], function (err, result, fields) {
                                if (err) throw err
                            });
                        }
                    } else {
                        dbcon.query('call create_email(?,?,?);', [c_id, email_t, email], function (err, result, fields) {
                            if (err) throw err
                        });
                    }
                });
            }
            proc(null);
        });
    },

    /**
     * Delete multiple contacts
     * @param callback to handle errors
     */
    deleteContacts: function (cid, proc) {
        for (var i = 0; i < cid.length; i++) {
            dbcon.query("call rem_old_phone_numbers(?);", [parseInt(cid[i])], function (err, result, fields) {
                if (err){ proc(err); return;}
            });
            dbcon.query("call rem_old_emails(?);", [parseInt(cid[i])], function (err, result, fields) {
                if (err){ proc(err); return;}
            });
            dbcon.query("call delete_contact(?);", [parseInt(cid[i])], function (err, result, fields) {
                if (err){ proc(err); return;}
            });
        }
    },

    /**
     * Get all contacts
     * @param username name of user whose contacts to retrieve
     * @param proc callback to handle result of type array
     */
    getAllContacts: function (username, proc) {
        dbcon.query('call get_all_contacts(?);', [username], function (err, result, fields) {
            if (err) throw err;

            for(var i =0; i<result[0].length; i++){
                if (result[0][i].c_email != null) {
                    result[0][i].c_email = result[0][i].c_email.split(',');
                }
                if (result[0][i].c_phone_no != null) {
                    result[0][i].c_phone_no = result[0][i].c_phone_no.split(',');
                }
            }

            proc(result[0]);
        });
    },

    /**
     * Get a single contact
     * @param cid id of contact/person
     * @param proc call back to handle result of type array
     */
    getContact: function (cid, proc) {
        dbcon.query('call get_contact(?);', [cid], function (err, result, fields) {
            if (result[0].length === 0) {
                proc(null);
                return;
            }
            if (result[0][0].c_phone_type != null) {
                result[0][0].c_phone_type = result[0][0].c_phone_type.split(',');
            }
            if (result[0][0].c_phone_no != null) {
                result[0][0].c_phone_no = result[0][0].c_phone_no.split(',');
            }
            if (result[0][0].c_email_type != null) {
                result[0][0].c_email_type = result[0][0].c_email_type.split(',');
            }
            if (result[0][0].c_email != null) {
                result[0][0].c_email = result[0][0].c_email.split(',');
            }
            proc(result[0][0]);
        });
    },

    /**
     * Get profile pic
     */
    getProfilePic: function(cid,proc){
        dbcon.query('call get_profile_pic(?);',[cid],function(err,result,fields){
            if(err){
                console.log(err);
                throw err;
            }
            proc(result);
        });
    }
}