const pg = require('pg');
const { connection } = require('../../config/db');

exports.getApartmentsList = (req, res) => {
    const db = new pg.Client(connection);
    const { city, budget } = req.query;
    db.connect(err => {
        if (err) {
            res.status(500).send({ success: true, status: 0, message: 'DB connection error', err });
            db.end();
        }
        else {
            db.query(`SELECT apartment_name, is_furnished, bedrooms, bathrooms, is_available, availabaility_time, adress1, address2, description, lat, long, is_featured, apartment_type, id, city, rent
            FROM chotu.apartments where LOWER(city) LIKE LOWER($1) AND rent <= $2;`,[`%${city}%`, budget ? parseInt(budget, 10) : 100000], (error, data) => {
                if (error) res.status(500).send({ success: false, status: 0, message: 'DB query error', error });
                else res.status(200).send({ success: true, status: 1, message: 'Okay', data: data.rows });
                db.end();
            })
        }
    })
}
