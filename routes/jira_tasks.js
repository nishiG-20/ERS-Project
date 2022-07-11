const express = require("express");
const router = express.Router();
const controller = require("../controllers/jira_controller");


router.post("/fetchJiraTasks", async function (req, res) {
  controller.fetchJiraProjectRecords(req, res)
});

module.exports = router;
