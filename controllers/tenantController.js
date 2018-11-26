var tenantModel = require('../models/tenantModel.js');
var factory = require('../models/factory.js');
const request = require("request");
const promise = require("request-promise");

/**
 * tenantController.js
 *
 * @description :: Server-side logic for managing tenants.
 */
module.exports = {

    /**
     * tenantController.list()
     */
    list: function (req, res) {
        tenantModel.find(function (err, tenants) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting tenant.',
                    error: err
                });
            }

            console.log(config);
            if (config.equipmentEnabled == false) {
                return res.json(tenants)
            }

            tenants = tenants.map(tenant => {
                return tenant.toObject();
            });

            getServiceUrl("equipment", "dev", "v1", function (err, url) {
                    if (err) {
                        return res.status(503).json(err);
                    }
                    let promises = []
                    for (let tenant of tenants) {
                        try {
                            promises.push(promise.get({
                                url: `http://${url}`,
                                qs: {
                                    "ownerId": tenant._id.toString()
                                }
                            }).then(function (equipment) {
                                tenant["equipment"] = JSON.parse(equipment);
                                return tenant;
                            }));
                        } catch (ex) {
                            console.error(ex);
                        }
                    }
        
                    Promise.all(promises).then(function (tenants) {
                        return res.json(tenants);
                    }).catch(err => {
                        console.log(err);
                        res.status(503).json("Equipment service unavailable");
                    });
                });
            });
    },

    /**
     * tenantController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        tenantModel.findOne({
            _id: id
        }, function (err, tenant) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting tenant.',
                    error: err
                });
            }
            if (!tenant) {
                return res.status(404).json({
                    message: 'No such tenant'
                });
            }
            return res.json(tenant);
        });
    },

    /**
     * tenantController.create()
     */
    create: function (req, res) {
        var tenant = new tenantModel({
            name: req.body.name,
            created: req.body.created,
            password: req.body.password,
            email: req.body.email

        });

        tenant.save(function (err, tenant) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating tenant',
                    error: err
                });
            }
            return res.status(201).json(tenant);
        });
    },

    /**
     * tenantController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        tenantModel.findOne({
            _id: id
        }, function (err, tenant) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting tenant',
                    error: err
                });
            }
            if (!tenant) {
                return res.status(404).json({
                    message: 'No such tenant'
                });
            }

            tenant.name = req.body.name ? req.body.name : tenant.name;
            tenant.created = req.body.created ? req.body.created : tenant.created;
            tenant.password = req.body.password ? req.body.password : tenant.password;
            tenant.email = req.body.email ? req.body.email : tenant.email;

            tenant.save(function (err, tenant) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating tenant.',
                        error: err
                    });
                }

                return res.json(tenant);
            });
        });
    },

    /**
     * tenantController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        tenantModel.findByIdAndRemove(id, function (err, tenant) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the tenant.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    },

    generateDummies: function (req, res) {
        var num = req.body.num;
        factory(num);
        tenantModel.find(function (err, tenants) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting tenant.',
                    error: err
                });
            }
            return res.json(tenants);
        });
    }
};