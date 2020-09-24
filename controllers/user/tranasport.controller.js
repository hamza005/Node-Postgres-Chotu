const pg = require('pg');
const { connection } = require('../../config/db');

exports.getTransports = (req, res) => {
    const { departure, arrival, departure_time, transport_type, transport_company } = req.body;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ status: 0, message: 'DB connection error' });
            db.end();
        }
        else {
            db.query(`SELECT * FROM chotu.transports
        where LOWER(daparture) LIKE LOWER ($1) AND LOWER(arrival) LIKE LOWER($2) AND LOWER(transport_type) LIKE LOWER($3) AND LOWER(transport_company) LIKE LOWER ($4)
        AND departure_time >= $5;`, [`${departure}%`, `${arrival}%`, `${transport_type}%`, `${transport_company}%`, departure_time], (error, data) => {
                if (error) res.status(500).send({ status: 0, message: 'Query Error', error });
                else res.status(200).send({ status: 1, data: data.rows });
                db.end();
            })
        }
    })
}

exports.bookTransport = (req, res) => {
    const { user_id, transport_id, no_of_seats } = req.body;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ status: 0, message: 'DB connection error' });
            db.end();
        }
        else {
            db.query(`select remainig_seats from chotu.transports where id = $1`, [transport_id], (error, data) => {
                if (error) {
                    res.status(500).send({ status: 0, message: 'Query Error', error });
                    db.end();
                }
                else {
                    const { remainig_seats } = data.rows[0];
                    db.query(`with new_booking as (INSERT INTO chotu.user_transports (user_id, transport_id, no_of_seats, created_date) VALUES($1, $2, $3, $4))
                    UPDATE chotu.transports set remainig_seats = $5 where chotu.transports.id = $6;`, [user_id, transport_id, no_of_seats, new Date(), remainig_seats - no_of_seats, transport_id], (error, b_data) => {
                        if (error) res.status(500).send({ status: 0, message: 'Query Error', error: error });
                        else res.status(200).send({ status: 1, message: 'Booking done' });
                        db.end();
                    })
                }
            })
        }
    })
}

exports.getUserBookings = (req, res) => {
    const { id } = req.params;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ status: 0, message: 'DB connection error' });
            db.end();
        }
        else{
            db.query(`SELECT user_id, transport_id, no_of_seats, created_date, chotu.user_transports.id as booking_id, daparture, arrival, departure_time, arrival_time, transport_type, total_seats, is_confirmed, remainig_seats, ticket_price, instructions, transport_company
            FROM chotu.user_transports
            JOIN chotu.transports on chotu.user_transports.transport_id = chotu.transports.id
            where chotu.user_transports.user_id = $1`, [id], (error, data) => {
                if (error) res.status(500).send({ status: 0, message: 'Query Error', error: error });
                else res.status(200).send({ status: 1, message: 'Okay', data:data.rows });
                db.end();
            })
        }
    })
}