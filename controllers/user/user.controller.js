const pg = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = require('../../config/auth.config');
const { connection } = require('../../config/db');
exports.registerNewUser = (req, res) => {
    const { first_name, last_name, email, phone, gender, dob, city, state, zip_code, company_name, address, country, booking_id } = req.body;
    if (!first_name || !last_name || !email || !phone || !country) {
        res.status(422).send({ success: false, status: 0, message: 'Invalid/Incomplete parameters' });
    }
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query('select * from chotu.users where email = $1', [email], (error, data) => {

                if (error) {
                    res.status(500).send({ success: false, status: 0, message: 'DB query error', error });
                    db.end();
                }
                else {
                    if (data.rows.length > 0) {
                        res.status(200).send({ success: false, status: 0, message: 'Email already exists' });
                        db.end();
                    }
                    else {
                        bcrypt.hash('chotu123', 10, (err, pas) => {
                            if (err) {
                                res.status(500).send({ success: true, status: 1, message: 'Couldnt create hashed password' });
                                db.end();
                            }
                            else {
                                db.query(`INSERT INTO chotu.users (first_name, email, phone, gender, dob, country, password, last_name, city, state, zip_code, address, company_name) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id;`,
                                    [first_name, email, phone, gender, dob, country, pas, last_name, city, state, zip_code, address, company_name], (errors, userdata) => {
                                        if (errors) {
                                            res.status(500).send({ success: false, status: 0, message: 'DB query error', error: errors });
                                            db.end();
                                        }
                                        else {
                                            if (booking_id) {
                                                db.query(`UPDATE chotu.apartment_booking set user_id=$1 where id=$2;`, [userdata.rows[0].id, booking_id], (b_error, b_data) => {
                                                    if (b_error) res.status(500).send({ success: false, status: 0, message: 'booking query error' })
                                                    else res.status(200).send({ success: true, status: 1, message: 'User saved & booking updated' });
                                                    db.end();
                                                })
                                            }
                                            else {
                                                res.status(200).send({ success: true, status: 1, message: 'Successfuly registered', user: userdata });
                                                db.end();
                                            }

                                        }
                                    })
                            }
                        });

                    }
                }

            })
        }
    })
}

exports.login = (req, res) => {
    const { email, password } = req.body;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query('select * from chotu.users where email = $1', [email], (error, data) => {
                if (error) res.status(500).send({ success: false, status: 0, message: 'DB query error', error });
                else {
                    if (data.rows.length === 0) {
                        res.status(200).send({ success: true, status: 1, message: 'Email is invalid' });
                    }
                    bcrypt.compare(password, data.rows[0].password, (er, result) => {
                        console.log(result)
                        if (er) {
                            res.status(401).send({ success: false, status: 0, message: 'Password is invalid' });
                            db.end();
                        }
                        else {
                            if (result) {
                                const token = jwt.sign({ email }, 'chotubackendsecret', {
                                    expiresIn: '1d' // expires in 1 day
                                });
                                res.status(200).send({ success: true, status: 1, user: data.rows[0], token });
                                db.end();
                            }
                            else {
                                res.status(401).send({ success: false, status: 0, message: 'Password is invalid' });
                                db.end();
                            }

                        }
                    })
                }
            })
        }
    })
}

exports.updateUser = (req, res) => {
    const { id, first_name, last_name, phone, country, email, city, state, zip_code, address, company_name} = req.body;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query(`UPDATE chotu.users
            SET first_name=$1, email=$2, phone=$3, country=$4, last_name=$5, city=$6, state=$7, zip_code=$8, address=$9, company_name=$10
            WHERE id=$11;`, [first_name, email, phone, country, last_name, city, state, zip_code, address, company_name, id], (error, user) => {
               if (error) res.status(500).send({ success: false, status: 0, message: 'Query error', error });
                else res.status(200).send({success:true, status:1, message:'User info updated'});
                db.end();
            })
        }
    });
}

exports.changeProfileImage =  (req, res) => {
    const { user_id } = req.body;
    const file = req.file.path;
    const db = new pg.Client(connection);
    db.connect(err => {
        if(err){
            res.status(500).send({success:false, status:0, message:'DB connection error', err});
            db.end();
        }
        else{
            db.query('update chotu.users set image=$1 where id = $2',[`http://18.223.32.178:3000/${file}`, user_id], (error, data) => {
                if(error) res.status(500).send({success:false, status:0, message:'query error', error});
                else res.status(200).send({success:true, status:1, message:'picture updated', image:'http://18.223.32.178:3000/'+file});
                db.end();
            })
        }
    })
}