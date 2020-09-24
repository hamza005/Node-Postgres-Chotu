const pg = require('pg');
const { connection } = require('../../config/db');

exports.saveUserFeedback = (req, res) => {
    const { message, booking_id, rating } = req.body ;
    const db = new pg.Client(connection);
    db.connect(err => {
        if(err){
            res.status(500).send({success:false, status:0, message:'DB connection error.', err});
            db.end();
        }
        else{
            db.query(`INSERT INTO guestnco.feedbacks (rating, feedback, booking_id) VALUES($1, $2, $3);`, [rating, message, booking_id], (error, bookings) => {
                if (error) res.status(500).send({success:false, status:0, message:'Query error', error});
                else res.status(200).send({success:true, status:1, message:'Feeback saved'});
                db.end();
            })
        }
    })
}