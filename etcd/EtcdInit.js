let Etcd = require("node-etcd");
let etcdUrls = process.env.ETCD_URL || "192.168.99.100:2379";
let etcd = new Etcd(etcdUrls);

const version = process.env.VERSION || "v1";
const environment = process.env.ENVIRONMENT || "prod";

const root = `/tenants/${environment}/${version}/`;

const defaultConfig = require("../default-config.json");
// Get default configuration from env and default-config.json
var config = {
    "equipmentEnabled": process.env.ETCD_EQUIPMENTENABLED == "true" ||
        defaultConfig[environment][version]["equipmentEnabled"] || false
};


// Get initial values
etcd.get(root, {
    recursive: true
}, function (err, res) {
    try {
        for (let i = 0; i < res.node.nodes.length; i++) {
            processConfig(res.node.nodes[i]);
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