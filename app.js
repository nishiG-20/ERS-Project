const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const jiraTasks = require("./routes/jira_tasks");
const cron = require("node-cron");
const coneJob = require("./ersUpdateApi.js");

var app;
var httpServer;
function setUpExpress() {
  app = express();
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "emerson.com");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header(
      "Content-Security-Policy",
      "default-src 'self'; object-src 'none'"
    );
    res.header("Expect-CT", "enforce,max-age=31536000");
    res.header("Referrer-Policy", "origin");
    res.header("X-Frame-Options", "sameorigin");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains;preload"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.removeHeader("X-Powered-By");
    next();
  });
  app.use("/api", jiraTasks);
  httpServer = http.Server(app);
  const port = process.env.PORT || "4000";
  app.set("port", port);
  httpServer.listen(port, () => {
    console.log(`Running on localhost:${port}`);
  });
}
const setupServer = () => {
  setUpExpress();
};
setupServer(true);

cron.schedule("*/2 * * * *", async () => {
  coneJob.fetchJiraProjectRecords();
});
