const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const fileupload = require('express-fileupload') 


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(fileupload());

// const options = {
//     origin: "*",
//     methods: ["GET", "POST", "PUT"],
//   };
//   app.use(cors(options));

app.get('/', function(req, res) {
    res.send("Welcome to our app");
})

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menuRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth/menu', menuRoutes);

const PORT = process.env.APP_PORT || 3030;
app.listen(PORT, () => {
    console.clear();
    console.log(`Food_app server in running on port ! ${PORT}`);
})

module.exports = app;