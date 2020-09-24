const auth = require('../utilities/auth.utility');
const aptCtrl = require('../controllers/user/apartment.controller');
const userCtrl = require('../controllers/user/user.controller');
const bookingCtrl = require('../controllers/user/booking.controller');
const tCtrl = require('../controllers/user/tranasport.controller');
const { file } = require('../utilities/fileupload.utility');
module.exports = app => {
  
    //profile and auth

    app.post('/user/register', userCtrl.registerNewUser);
    app.post('/user/login', userCtrl.login);
    app.post('/user/changeimage', file, userCtrl.changeProfileImage)

    //Booking APIs

    app.post('/user/bookapartment', bookingCtrl.bookApartment);
    app.get('/user/bookings/:id', bookingCtrl.getbookingDetails);
    app.get('/user/bookedapartmetndetails/:id', bookingCtrl.getBookedAptDetails);
    app.get('/user/getapartmentlist', aptCtrl.getApartmentsList);


    app.post('/user/transports', tCtrl.getTransports);
    app.post('/user/transports/book', tCtrl.bookTransport);
    app.get('/user/transports/:id', tCtrl.getUserBookings);

};
