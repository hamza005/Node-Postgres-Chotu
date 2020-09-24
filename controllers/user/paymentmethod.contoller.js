const pg = require('pg');
const { connection } = require('../../config/db');


exports.getUserPaymentMethods = (req, res) => {
    const db = new pg.Client(connection);
    const { id } = req.params;
    db.connect(err => {
        if(err){
            res.status(500).send({success:false, status:0, message:'DB connection error.', err});
            db.end();
        }
        else{
            db.query(`select * from guestnco.user_payment_methods where user_id=$1;`, [id], (error, paymentmethods) => {
                if (error) res.status(500).send({success:false, status:0, message:'Query error', error});
                else res.status(200).send({success:true, status:1, data:paymentmethods.rows});
                db.end();
            })
        }
    })
}

exports.addUserPaymentMethod = (req, res) => {
    const db = new pg.Client(connection);
    const { payment_type, card_no, card_cvc, card_expiry, user_id } = req.body;
    db.connect(err => {
        if(err){
            res.status(500).send({success:false, status:0, message:'DB connection error.', err});
            db.end();
        }
        else{
            db.query(`INSERT INTO guestnco.user_payment_methods
            (payment_type, card_no, card_cvc, card_expiry, created_date, user_id)
            VALUES($1, $2, $3, $4, $5, $6) returning id;`, [payment_type, card_no, card_cvc, card_expiry, new Date(), user_id], (error, paymentmethod) => {
                if (error) res.status(500).send({success:false, status:0, message:'Query error', error});
                else {
                    const pm_id = paymentmethod.rows[0].id;
                    const data = {
                        id:pm_id,
                        payment_type,
                        card_no,
                        card_cvc,
                        card_expiry,
                        created_date: new Date(),
                        user_id
                    }
                    res.status(200).send({success:true, status:1, data, message:'Payment method saved'});
                }
                db.end();
            })
        }
    })
}