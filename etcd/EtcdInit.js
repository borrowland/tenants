let Etcd = require("node-etcd");
let etcdUrls = process.env.ETCD_URL || "192.168.99.100:2379";
let etcd = new Etcd(etcdUrls);

let watcher2 = etcd.watcher("/tenants/v1/message", null, {recursive: true});
watcher2.on("change", (val) => {
    console.log("message value changed: " + val);
    // process.env.DB_URI = val;
});