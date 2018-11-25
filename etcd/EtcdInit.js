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
    // "services": {
    //     "equipment": {
    //         "dev": {
    //             "v1": {
    //                 27: '127:0.0.1:8081/equipment/v1'
    //             },
    //             "v2": {}
    //         },
    //     }
    // }
};

function discoverService(name, env, ver) {
    let service = `${name}/${env}/${ver}`
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

discoverService("equipment", "dev", "v1");


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