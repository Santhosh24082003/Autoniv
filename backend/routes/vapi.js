const express = require('express');
const router = express.Router();
const vapiController = require('../controllers/vapiController');

router.post('/lead', vapiController.captureLead);
router.post('/booking', vapiController.captureBooking);
router.get('/health', vapiController.health);

module.exports = router;
