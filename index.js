const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//init ETCD and watch variables
global.config = require("./etcd/EtcdInit");

var user = process.env.DB_USER || "root";
var password = process.env.DB_PASSWORD || "password";
var db_uri = process.env.DB_URI || "192.168.99.100:27017";

mongoose.connect(`mongodb://${user}:${password}@${db_uri}/tenants?authSource=admin`, {
    useNewUrlParser: true
});

var db = mongoose.connection;

const port = process.env.PORT || 8080;
const environment = process.env.ENVIRONMENT || "prod";
const version = process.env.VERSION || "v1";
let app = express();
let baseUrl = "/tenants/" + version;

// body parser must be initiated before any request route
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// init each route separately
app.use(baseUrl, require("./routes/tenantRoutes"));

// Leave here for easy checking if the app is running.
app.get('/', (req, res) => res.send('<h1> Tenants API running!</h1>'));

// Check configuration
app.get('/etcd', (req, res) => res.send(JSON.stringify(config)));

app.get('/v1/demo/info', (req, res) => {
    let a = {
        "clani": ["jg1278", "mk7509"],
        "opis_projekta": "Nas projekt implementira aplikacijo za izposojo opreme.",
        "mikrostoritve": ["http://159.122.186.19:35000/tenants/v1", "http://159.122.186.19:32385/equipment/v1"],
        "github": ["https://github.com/borrowland/tenants", "https://github.com/borrowland/equipment"],
        "travis": ["https://travis-ci.org/borrowland/tenants", "https://travis-ci.org/borrowland/equipment"],
        "dockerhub": ["https://hub.docker.com/r/mkoplan/tenants/", "https://hub.docker.com/r/mkoplan/equipment/"]
    }
    res.send(a)
})

app.listen(port, function () {
    console.log(`Running server on port ${port}. Version: ${version}  Environment: ${environment}`);
});