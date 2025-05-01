const express = require('express');
const router = express.Router();
const { protect, role } = require('../Middleware/authMiddleware');
const requestController = require('../controllers/requestController');

router.post('/', 
  protect,
  role('user'),
  requestController.createRequest
);

router.get('/my-requests', 
  protect,
  role('user'),
  requestController.getUserRequests
);

router.get('/issuer', 
  protect,
  role('issuer', 'admin'),
  requestController.getIssuerRequests
);

router.put('/:id', 
  protect,
  role('issuer', 'admin'),
  requestController.updateRequestStatus
);

router.get('/pending', 
  protect,
  // role('issuer', 'admin'),
  requestController.getPendingRequests
);

module.exports = router;