const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/user');

router.post('/details', getProfile);

module.exports = router;
