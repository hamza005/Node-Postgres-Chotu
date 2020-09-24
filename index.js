const express = require('express');
const app = express();
require('dotenv').config();
require('./config/express.config')(app);
require('./routes/users_route')(app);
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Chotu API is connected at port ${port}`));
app.get('/', (req, res) => {
    res.send('Welcom to Chotu API server')
})

