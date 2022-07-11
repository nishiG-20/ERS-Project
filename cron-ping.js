const request = require("request");
const requestPromise = require("request-promise");
const utils = require("./lib/utils");
const config = require("./enum/enum.js");

//Declaring body and header for Jira Project Records
const makeOptionsforJiraProjectRecords = (start, maxResults = 50) => {
  let currentDate = utils.formatDate(new Date());
  let oldDate = utils.subtractMonths(5);

  return {
    method: "POST",
    url: "http://localhost:4000/api/fetchJiraTasks",
    json: true,
    body: {
      jql: `createdDate<=${currentDate} AND createdDate>=${oldDate}`,
      fieldsByKeys: false,
      fields: [
        "summary",
        "status",
        "assignee",
        "project",
        "created",
        "customer",
        "created",
      ],
      startAt: start,
      maxResults: maxResults,
    },
  };
};

//Declaring header for ERS Project Records
const makeOptionsforfetchERSRecords = (offset, limit) => {
  const { getAllERSProjects } = config;
  const { contentType, Authorization, url, method } = getAllERSProjects;

  let replaceOffsetUrl = url;
  replaceOffsetUrl = url.replace("?offset_val", offset);

  let replaceLimitsUrl = replaceOffsetUrl;
  replaceLimitsUrl = replaceOffsetUrl.replace("?total_limit", limit);

  let headers = {
    "Content-Type": contentType,
    Authorization: Authorization,
  };
  return {
    method: method,
    headers: headers,
    url: replaceLimitsUrl,
    json: true,
  };
};

//Declaring header for ERS Tasks
const makeOptionsForGetERSTask = (ersProjectId) => {
  const { getTasksOfERSProject } = config;
  const { contentType, Authorization, url, method } = getTasksOfERSProject;
  let apiURL = url;
  apiURL = url.replace("?project_id", ersProjectId);

  let headers = {
    "Content-Type": contentType,
    Authorization: Authorization,
  };

  return {
    method: method,
    headers: headers,
    url: apiURL,
    json: true,
  };
};

//Declaring header and body for ERS Tasks
const makeOptionsForCreateJiraTasksInERS = (
  jiraTaskName,
  createdDateOfJIRAProj,
  ersProjectId
) => {
  const { creatingERSProjectsTask } = config;
  const { contentType, Authorization, url, method } = creatingERSProjectsTask;

  let apiURL = url;
  apiURL = url.replace("?project_id", ersProjectId);

  let headers = {
    "Content-Type": contentType,
    Authorization: Authorization,
  };

  let body = {
    name: jiraTaskName,
    start_time: createdDateOfJIRAProj,
  };

  return {
    method: method,
    url: apiURL,
    json: true,
    body: body,
    headers: headers,
  };
};

//Declaring header and body for Creating ERS Project
const makeOptionsForERSCreateProject = (projName, createdDate) => {
  const { creatingERSProject } = config;
  const {
    contentType,
    authorizationToken,
    url,
    method,
    projectType,
    udfBillingStatus,
  } = creatingERSProject;

  let headers = {
    "Content-Type": contentType,
    Authorization: authorizationToken,
  };

  let body = {
    title: projName,
    project_type_id: projectType.standard,
    project_start_date: createdDate,
    udf_billing_status: udfBillingStatus.billable,
  };

  return {
    method: method,
    url: url,
    json: true,
    body: body,
    headers: headers,
  };
};

//Checking Jira Project is Exists in ERS or not
const isJiraProjInERS = (jiraProj, ersRecords) => {
 
  let isProjectExist = ersRecords.find(
    (ersProj) => ersProj.title === jiraProj
  );
  if (isProjectExist) {
    return isProjectExist.id;
  } else {
    return 0;
  }
};

//Checking Jira Task is Exists in ERS or not
const isJiraTaskInERS = (jiraTask, ersTasks) => {
  if (ersTasks.find((task) => task.name === jiraTask)) {
    return 1;
  } else {
    return 0;
  }
};

let startAt = 0;
let jiraTotalRecords;
let jiraProjectData = [];
let maxJiraResults;

const fetchingInitialMaxResultsofJira = async () => {
  let options = await makeOptionsforJiraProjectRecords(startAt);
  return new Promise((resolve, reject) => {
    try {
      request(options, (error, response) => {
        if (response.body) {
          jiraTotalRecords = response.body.total;
          response.body.issues.forEach((elem) => jiraProjectData.push(elem));
          maxJiraResults = response.body.maxResults;
          startAt = startAt + maxJiraResults;
          resolve(true);
        }
      });
    } catch (error) {
      Promise.reject(error);
    }
  });
};

function makeAPIsCall(options) {
  return requestPromise(options);
}

async function fetchingNextJiraRecords() {
  let result;
  for (let i = startAt; i < jiraTotalRecords; i += maxJiraResults) {
    let options = makeOptionsforJiraProjectRecords(i, maxJiraResults);
    result = await makeAPIsCall(options);
    result.issues.forEach((elem) => jiraProjectData.push(elem));
  }
  return jiraProjectData;
}

let offsetVal = 0;
let ersLimit = 500;
let ersData = [];
let ersTotalCount;

const fetchingInitialMaxResultsofErs = async () => {
  let options = makeOptionsforfetchERSRecords(offsetVal, ersLimit);
  return new Promise((resolve, reject) => {
    try {
      request(options, async (error, response) => {
        if (response.body) {
          let ersRecords = response.body;
          if (ersRecords) {
            offsetVal = offsetVal + ersRecords.limit;
            ersTotalCount = ersRecords.total_count;
            ersLimit = ersRecords.limit;
            ersRecords.data.forEach((elem) => ersData.push(elem));
            resolve(true);
          }
        } else {
          reject(error);
        }
      });
    } catch (error) {
      throw error;
    }
  });
};

function makeAPIsCallforErsRecord(options) {
  return requestPromise(options);
}

async function fetchingNextErsRecords() {
  let result;
  for (let i = offsetVal; i < ersTotalCount; i += ersLimit) {
    let options = makeAPIsCallforErsRecord(offsetVal, ersLimit);
    result = await makeAPIsCall(options);
    result.data.forEach((elem) => ersData.push(elem));
  }
  return ersData;
}

function cronJobs() {
  cronJobs.prototype.fetchJiraProjectRecords = async () => {
    if (await fetchingInitialMaxResultsofErs()) {
      await fetchingNextErsRecords();
    }
    await fetchingInitialMaxResultsofJira();
    let totalJiraProjData = await fetchingNextJiraRecords();
    if (totalJiraProjData) {
      await this.loadJiraDataInERS(totalJiraProjData);
    }
  };

  cronJobs.prototype.loadJiraDataInERS = async (jiraRecords) => {
    try {
    
      for (let i = 0; i < jiraRecords.length; i++) {
        let jiraTask = jiraRecords[i].key + " " + jiraRecords[i].fields.summary;

        //Created Date of the JIRA Project
        let year = new Date(jiraRecords[i].fields.created).getFullYear();
        let month = utils.padTo2Digits(
          new Date(jiraRecords[i].fields.created).getMonth() + 1
        );
        let dateOfTheDay = utils.padTo2Digits(
          new Date(jiraRecords[i].fields.created).getDate()
        );

        let createdDateOfJIRAProj = `${year}-${month}-${dateOfTheDay}`;

        //Check Jira Proj is Present in ERS or not and if yes? Get the Id
        let ersProjectId = isJiraProjInERS(
          jiraRecords[i].fields.project.name,
          ersData
        );

        if (ersProjectId) {
          //Get The Tasks of the ERS Project
          let ersTasks = await this.getERSTasks(ersProjectId);

          //If ERS Project has Task
          if (ersTasks.total_count) {
            //To check that JIRA task is present in ERS or not
            if (!isJiraTaskInERS(jiraTask, ersTasks.data)) {
              await this.createJiraTasksinERS(
                jiraTask,
                createdDateOfJIRAProj,
                ersProjectId
              );
            }
          } else {
            //If ERS Project has no Task
            await this.createJiraTasksinERS(
              jiraTask,
              createdDateOfJIRAProj,
              ersProjectId
            );
          }
        } else {
          //Create ERS Project
          let resp = await this.createERSProject(
            jiraRecords[i].fields.project.name,
            createdDateOfJIRAProj
          );

          if (resp) {
            //Find the ID of the Recently Created Project in ERS
            let ersProjectId = isJiraProjInERS(
              jiraRecords[i].fields.project.name,
              ersData
            );

            if (ersProjectId) {
              //Create the Task of the Recently Created Project in ERS
              await this.createJiraTasksinERS(
                jiraTask,
                createdDateOfJIRAProj,
                ersProjectId
              );
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  cronJobs.prototype.getERSTasks = async (ersProjectId) => {
    let options = makeOptionsForGetERSTask(ersProjectId);
    return new Promise((resolve, reject) => {
      try {
        request(options, async (error, response) => {
          if (response) {
            let ersTasks = await response.body;
            resolve(ersTasks);
          } else {
            reject(error);
          }
        });
      } catch (error) {
        throw error;
      }
    });
  };

  cronJobs.prototype.createJiraTasksinERS = async (
    jiraTask,
    createdDateOfJIRAProj,
    ersProjectId
  ) => {
    let options = makeOptionsForCreateJiraTasksInERS(
      jiraTask,
      createdDateOfJIRAProj,
      ersProjectId
    );
    return new Promise((resolve, reject) => {
      try {
        request(options, async (error, response) => {
          if (error) {
            reject(error);
          }
        });
      } catch (error) {
        throw error;
      }
    });
  };

  cronJobs.prototype.createERSProject = async (projName, createdDate) => {
    let options = makeOptionsForERSCreateProject(projName, createdDate);
    return new Promise((resolve, reject) => {
      try {
        request(options, async (error, response) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode === 201) {
              resolve(true);
            }
          }
        });
      } catch (error) {
        throw error;
      }
    });
  };
}

module.exports = new cronJobs();
