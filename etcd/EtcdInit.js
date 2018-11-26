const _ = require("lodash");
const Etcd = require("node-etcd");
const etcdUrls = process.env.ETCD_URL || "192.168.99.100:2379";
const etcd = new Etcd(etcdUrls);

const version = process.env.VERSION || "v1";
const environment = process.env.ENVIRONMENT || "prod";

const root = `/tenants/${environment}/${version}/`;

const defaultConfig = require("../default-config.json");
// Get default configuration from env and default-config.json
var config = {
    "equipmentEnabled": process.env.ETCD_EQUIPMENTENABLED == "true" ||
        defaultConfig[environment][version]["equipmentEnabled"] || false,
};

global.getServiceUrl = function (name, env, ver, callback) {
    if (_.get(config, ["services", name, env, ver])) {
        callback(null, _.sample(config["services"][name][env][ver]));
    } else {
        discoverService(name, env, ver, function (err, url) {
            callback(err, url);
        });
    }
}

global.discoverService = function(name, env, ver, callback) {
    let service = `${name}/${env}/${ver}/routes`;
    etcd.get(service, {
        recursive: true
    }, function (err, res) {
        try {
            for (let node of res.node.nodes) {
                let url = JSON.parse(node.value);
                let key = node.key.split("/").pop();
                _.set(config, ["services", name, env, ver, `_${key}`], `${url.hostname}:${url.port}/${name}/${ver}`);
            }
            callback(null, _.sample(config["services"][name][env][ver]));
        } catch (ex) {
            console.error(ex);
            callback(Error(`Error discovering ${service}`), null);
        }
    });
    watchService(name, env, ver);
}

global.watchService = function (name, env, ver) {
    let service = `${name}/${env}/${ver}`;
    let watcher = etcd.watcher(`${service}/routes`,
        null, {
            recursive: true
        },
    );
    watcher.on("change", (val) => {
        try {
            let url = JSON.parse(val.node.value);
            let key = val.node.key.split("/").pop();
            _.set(config, ["services", name, env, ver, `_${key}`], `${url.hostname}:${url.port}/${name}/${ver}`);
        } catch (ex) {
            console.error(ex);
            let key = val.node.key.split("/").pop();
            console.log("removing", key);
            _.unset(config, `services.${name}.${env}.${ver}._${key}`);
        }
    });
}

// Get initial values
etcd.get(root, {
    recursive: true
}, function (err, res) {
    try {
        for (let node of res.node.nodes) {
            processConfig(node);
        }
    } catch (ex) {
        console.error(ex);
        setDefault();
    }
});

// Watcher setup
let watcher = etcd.watcher(root, null, {
    recursive: true
});

watcher.on("change", (val) => {
    processConfig(val.node);
});

// validate and process configuration change
function processConfig(node) {
    let key = node.key.replace(root, '');
    let value = node.value;

    // Optional validations
    switch (key) {
        case "equipmentEnabled":
            value = value == "true";
            break;
    }

    // Save keys
    config[key] = value;
}

module.exports = config;

function setDefault() {
    for (let env in defaultConfig) {
        for (let ver in defaultConfig[env]) {
            for (let key in defaultConfig[env][ver]) {
                etcd.set(`/tenants/${env}/${ver}/${key}`, defaultConfig[env][ver][key]);
            }
        }
    }
}