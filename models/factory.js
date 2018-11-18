const dummy = require('mongoose-dummy');
const tenantModel = require('./tenantModel');
const ignoredFields = ["_id"];


const generate = function (n) {
    for (var i = 0; i < n; i++) {
        console.log("generating dummy");
        var dummyTenant = new tenantModel(dummy(tenantModel, {
            ignore: ignoredFields,
            returnDate: true
        }));

        dummyTenant.save();
    }
}

module.exports = generate;