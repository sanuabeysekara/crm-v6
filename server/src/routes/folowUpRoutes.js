const express = require("express")
const followUpController = require('../controllers/followUpController')

const router = express.Router()

router.get('/followUps', followUpController.getFollowUps)
router.post('/followUps', followUpController.addFollowUp)
router.patch('/followUps/:id', followUpController.updateFollowUp)
router.get('/followUps/:id', followUpController.getFollowUp)
router.get('/followups/by-lead/:lead_id', followUpController.getFollowUpsByLead);
router.get('/followupsdate', followUpController.getFollowUpDate)
router.get('/followupsdate/:user_id', followUpController.getFollowUpDateByUser);

module.exports = router