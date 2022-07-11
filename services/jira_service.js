var requestModule = require("request");
const enumValues = require("../enum/enum.js");

exports.fetchJiraProjectRecords = async (req) => {
  const { fetchingJiraRecords } = enumValues;
  const { contentType, authorizationToken, jiraURL, method } =
    fetchingJiraRecords;
  return new Promise((resolve, reject) => {
    try {
      var headers = {
        "Content-Type": contentType,
        Authorization: authorizationToken,
      };
      var options = {
        method: method,
        url: jiraURL,
        headers: headers,
        json: true,
        body: req,
      };
      requestModule(options, function (error, response, body) {
        if (response.body.errorMessages) {
          response.body.message = response.body.errorMessages[0];
          response.body.errorIn = "Jira";
          response.body.statusCode = response.statusCode;
          reject(response.body);
        }
        resolve(response.body);
      });
    } catch (error) {
      reject(error);
    }
  });
};
