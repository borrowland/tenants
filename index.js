const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//init ETCD and watch variables
require("./etcd/EtcdInit");

var user = process.env.DB_USER || "root";
var password = process.env.DB_PASSWORD || "password";
var db_uri = process.env.DB_URI || "192.168.99.100:27017";

mongoose.connect(`mongodb://${user}:${password}@${db_uri}/tenants?authSource=admin`);

var db = mongoose.connection;

const port = process.env.PORT || 8080;
let app = express();
let baseUrl = "/v1";

// body parser must be initiated before any request route
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// init each route separately
app.use(baseUrl + "/tenants", require("./routes/tenantRoutes"));

// Leave here for easy checking if the app is running.
app.get('/', (req, res) => res.send('<h1> Tenants API running!</h1>'));


app.listen(port, function () {
    console.log("Running server on port " + port);
});