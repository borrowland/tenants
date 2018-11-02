var express = require('express');
var router = express.Router();
var tenantController = require('../controllers/tenantController.js');

/*
 * GET
 */
router.get('/', tenantController.list);

/*
 * GET
 */
router.get('/:id', tenantController.show);

/*
 * POST
 */
router.post('/', tenantController.create);

/*
 * PUT
 */
router.put('/:id', tenantController.update);

/*
 * DELETE
 */
router.delete('/:id', tenantController.remove);



module.exports = router;