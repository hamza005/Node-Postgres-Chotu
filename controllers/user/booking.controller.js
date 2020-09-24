const pg = require('pg');
const format = require('pg-format');
const { connection } = require('../../config/db');

exports.bookApartment = (req, res) => {
    const { user_id, apartment_id, checkin_date, checkout_date, guests, extra_services, user_info } = req.body;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query(`INSERT INTO chotu.apartment_booking (apartment_id, user_id, checkin_date, checkout_date, guests, created_date, user_info) VALUES($1, $2, $3, $4, $5, $6, $7) returning id;`,
                [apartment_id, user_id, checkin_date, checkout_date, guests, new Date(), user_info], (error, data) => {
                    if (error) {
                        res.status(500).send({ success: false, message: 'Query error 1', status: 0, error });
                        db.end();
                    }
                    else {
                        let resp = {};
                        resp.booking_id = data.rows[0].id
                        resp.booking_data = req.body
                        res.status(200).send({ success: true, status: 1, message: 'Booking done', data: resp });
                        db.end();
                    }
                })
        }
    })
}

exports.getbookingDetails = (req, res) => {
    const { id } = req.params;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query(`SELECT chotu.apartment_booking.apartment_id, user_id, checkin_date, checkout_date, guests, apartment_booking.created_date as booking_time, apartment_booking.id as booking_id, user_info,
            apartment_name, rent
            FROM chotu.apartment_booking
            left join chotu.apartments on chotu.apartment_booking.apartment_id = chotu.apartments.id
            where user_id = $1`, [id], (error, data) => {
                if (error) res.status(500).send({ success: false, message: 'Query error', status: 0, error });
                else res.status(200).send({status:1, data:data.rows})
                db.end();
                
            })
        }
    })
}
exports.getBookedAptDetails = (req, res) => {
    const { id } = req.params;
    const db = new pg.Client(connection);
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: false, message: 'DB connection error', status: 0, err });
        }
        else {
            db.query(`SELECT guestnco.apartment_booking.apartment_id, apartment_name, adress1, address2, description, lat, long, city, ARRAY_AGG(image) as images FROM guestnco.apartment_booking
             JOIN guestnco.apartments on guestnco.apartment_booking.apartment_id = guestnco.apartments.id
             JOIN guestnco.apartment_images on guestnco.apartments.id = guestnco.apartment_images.apartment_id
             where guestnco.apartment_booking.id = $1
             group by guestnco.apartment_booking.apartment_id, apartment_name, adress1, address2, description, lat, long, city`, [id], (error, data) => {
                if (error) res.status(500).send({ success: false, message: 'Query error', status: 0, error });
                else res.status(200).send({ success: true, status: 1, message: 'Okay', data: data.rows[0] });
                db.end();
            })
        }
    })
}