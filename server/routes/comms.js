import express from 'express';
const router = express.Router();
  
router.get('/channelID', function(req, res) {
 		res.send({channelID:'webapp'}); 		
	}
);

module.exports = router;