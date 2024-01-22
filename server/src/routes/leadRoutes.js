const express = require('express')
const leadController = require('../controllers/leadController')
const fbLeadController = require('../controllers/fbLeadController')

const router = express.Router()

router.get('/leads', leadController.getLeads)
router.post('/leads', leadController.addLead)
router.get('/leads/:id', leadController.getOneLeadSummaryDetails)
router.patch('/leads/:id', leadController.updateLead)
router.get('/leads-details', leadController.getLeadsSummaryDetails)
router.get('/checkLead', leadController.checkForDuplicate)
router.get('/fbleads', fbLeadController.getLeads)
router.post('/fbleads', fbLeadController.postLeads)
module.exports = router