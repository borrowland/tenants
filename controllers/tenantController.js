var tenantModel = require('../models/tenantModel.js');

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
            return res.json(tenants);
        });
    },

    /**
     * tenantController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        tenantModel.findOne({_id: id}, function (err, tenant) {
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
			name : req.body.name,
			created : req.body.created,
			password : req.body.password,
			email : req.body.email

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
        tenantModel.findOne({_id: id}, function (err, tenant) {
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
    }
};
