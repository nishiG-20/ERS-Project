const request = require("request");
const requestPromise = require("request-promise");
const utils = require("./lib/utils");
const config = require("./enum/enum.js");

//Declaring body and header for Jira Project Records
const makeOptionsforJiraProjectRecords = (start, maxResults = 50) => {
  // let currentDate = utils.formatDate(new Date());
  // let oldDate = utils.subtractMonths(5);

  let oldDate = utils.subtractDays(10);

  return {
    method: "POST",
    url: "http://localhost:4000/api/fetchJiraTasks",
    json: true,
    body: {
      // jql: `createdDate<=${currentDate} AND createdDate>=${oldDate}`,
      jql: `createdDate>=${oldDate}`,
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

//Declaring Header and Body for updating ERS Project
const makeOptionsForUpdateTaskInErs = (
  projectId,
  taskId,
  taskName,
  createdDateOfJIRAProj
) => {
  const { updateTasksOfERSProject } = config;
  const { contentType, Authorization, url, method } = updateTasksOfERSProject;

  let urlAfterReplacingProjId = url.replace("?project_id", projectId);
  let urlAfterReplacingTaskId = urlAfterReplacingProjId.replace(
    "?task_id",
    taskId
  );

  let headers = {
    "Content-Type": contentType,
    Authorization: Authorization,
  };

  let body = {
    name: taskName,
    start_time: createdDateOfJIRAProj,
  };

  return {
    method: method,
    headers: headers,
    url: urlAfterReplacingTaskId,
    body: body,
    json: true,
  };
};

//Declaring authentication for  finding project Details
const makeOptionsForERSCreateProject = (
  projName,
  createdDate,
  email,
  projectManagerId
) => {
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
    email: email,
    udf_project_manager: projectManagerId,
  };

  return {
    method: method,
    url: url,
    json: true,
    body: body,
    headers: headers,
  };
};

//Declaring header and body for Creating ERS Project
const makeOptionsForFindJiraProjectInfo = (projectId) => {
  const { findJiraProjDetails } = config;
  const { contentType, Username, Password, url, method } = findJiraProjDetails;

  let apiURL = url;
  apiURL = url.replace("?project_id", projectId);

  let headers = {
    "Content-Type": contentType,
  };

  let auth = {
    user: Username,
    pass: Password,
  };

  return {
    method: method,
    url: apiURL,
    json: true,
    headers: headers,
    auth: auth,
  };
};

//Checking Jira Project is Exists in ERS or not
const isJiraProjInERS = async (jiraProj, ersRecords) => {
  let isProjectExist = ersRecords.find((ersProj) => ersProj.title === jiraProj);

  if (isProjectExist) {
    return isProjectExist.id;
  } else {
    return 0;
  }
};

const formatCreatedDate = (createdDate) => {
  let year = new Date(createdDate).getFullYear();
  let month = utils.padTo2Digits(new Date(createdDate).getMonth() + 1);
  let dateOfTheDay = utils.padTo2Digits(new Date(createdDate).getDate());

  return `${year}-${month}-${dateOfTheDay}`;
};

//Calling Api to Update The Task of ERS
const updateERSTask = (projId, taskId, jiraTask, createdDateOfJIRAProj) => {
  let options = makeOptionsForUpdateTaskInErs(
    projId,
    taskId,
    jiraTask,
    createdDateOfJIRAProj
  );
  return new Promise((resolve, reject) => {
    try {
      request(options, async (error, response) => {
        if (response.statusCode === 200) {
          resolve(true);
        } else {
          reject(error);
        }
      });
    } catch (error) {
      throw error;
    }
  });
};

//Checking Jira Task is Exists in ERS or not
const isJiraTaskInERS = async (
  jiraTask,
  ersTasks,
  jiraTaskKey,
  createdDateOfJIRAProj
) => {
  let ersTask = ersTasks.find((task) => task.name === jiraTask);
  if (
    ersTask &&
    formatCreatedDate(ersTask.created_on) === createdDateOfJIRAProj
  ) {
    console.log(1, " ", jiraTaskKey, " ", jiraTask);
    return 1;
  } else {
    let isKeyExistsInErsTask = ersTasks.find(
      (task) => task.name.substring(0, task.name.indexOf(" ")) === jiraTaskKey
    );

    if (isKeyExistsInErsTask) {
      //Update The Task Details
      let resp = await updateERSTask(
        isKeyExistsInErsTask.project_id,
        isKeyExistsInErsTask.id,
        jiraTask,
        createdDateOfJIRAProj
      );
      if (resp === true) {
        console.log(2, " ", jiraTaskKey, " ", jiraTask);
        return 1;
      }
    } else {
      console.log(3, " ", jiraTaskKey, " ", jiraTask);
      return 0;
    }
  }
};

const findProjectLeadId = (projLeadName) => {
  const { projectLeads } = config;
  let projectLeadInfo = projectLeads.find((elem) => elem.name === projLeadName);
  return projectLeadInfo && projectLeadInfo.id ? projectLeadInfo.id : 11516;
};

let startAt;
let jiraTotalRecords;
let maxJiraResults;
let jiraProjectData;

const fetchingInitialMaxResultsofJira = async () => {
  startAt = jiraTotalRecords = maxJiraResults = 0;
  jiraProjectData = [];

  let options = await makeOptionsforJiraProjectRecords(startAt);
  return new Promise((resolve, reject) => {
    try {
      request(options, (error, response) => {
        if (response.body && response.statusCode === 200) {
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

let offsetVal;
let ersLimit = 500;
let ersData;
let ersTotalCount;

const fetchingInitialMaxResultsofErs = async () => {
  offsetVal = ersTotalCount = 0;
  ersData = [];
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

const makeAPIsCallforErsRecord = async (options) => {
  return requestPromise(options);
};

async function fetchingNextErsRecords() {
  let result;
  for (let i = offsetVal; i < ersTotalCount; i += ersLimit) {
    let options = await makeAPIsCallforErsRecord(offsetVal, ersLimit);
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
    console.log(jiraRecords.length);
    try {
      for (let i = 0; i < jiraRecords.length; i++) {
        let jiraTaskKey = jiraRecords[i].key;
        let jiraSummary = jiraRecords[i].fields.summary;
        jiraSummary.replace(/"/g, "");
        let task = `${jiraRecords[i].key} ${jiraSummary}`;
        let jiraTask = task.substring(0, 99);

        //let emailAddress = jiraRecords[i].fields.assignee.emailAddress;
        let emailAddress = "shakun.arora@rstartec.com";

        let jiraProjName = jiraRecords[i].fields.project.name;

        //  let jiraProjName = "Testing pro";

        let jiraProjectId = jiraRecords[i].fields.project.id;

        let jiraProjectInfo = await this.findJiraProjectInfo(jiraProjectId);

        let projretLeadId =
          jiraProjectInfo === "Shakun Arora"
            ? findProjectLeadId("Shakun Arora")
            : findProjectLeadId(jiraProjectInfo.lead.displayName);

        let createdDateOfJIRAProj = formatCreatedDate(
          jiraRecords[i].fields.created
        );

        //Check Jira Proj is Present in ERS or not and if yes? Get the Id
        let ersProjectId = await isJiraProjInERS(jiraProjName, ersData);

        if (ersProjectId) {
          //Get The Tasks of the ERS Project
          let ersTasks = await this.getERSTasks(ersProjectId);

          //If ERS Project has Task
          if (ersTasks.total_count) {
            //To check that JIRA task is present in ERS or not

            if (
              !(await isJiraTaskInERS(
                jiraTask,
                ersTasks.data,
                jiraTaskKey,
                createdDateOfJIRAProj
              ))
            ) {
              // console.log('Task should be created....')
              await this.createJiraTasksinERS(
                jiraTask,
                createdDateOfJIRAProj,
                ersProjectId
              );
            }
          } else {
            // If ERS Project has no Task
            await this.createJiraTasksinERS(
              jiraTask,
              createdDateOfJIRAProj,
              ersProjectId
            );
          }
        } else {
          console.log("4");
          //Create ERS Project
          let resp = await this.createERSProject(
            jiraProjName,
            createdDateOfJIRAProj,
            emailAddress,
            projretLeadId
          );

          if (await fetchingInitialMaxResultsofErs()) {
            ersData = await fetchingNextErsRecords();
          }

          if (resp) {
            console.log("5");
            //Find the ID of the Recently Created Project in ERS
            let ersProjectId = await isJiraProjInERS(jiraProjName, ersData);

            if (ersProjectId) {
              console.log("6");
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
    // console.log('Task should be created part-2')
    // console.log(options)
    return new Promise((resolve, reject) => {
      try {
        request(options, async (error, response) => {
          console.log("Status is.." + response.statusCode);
          if (response.statusCode === 201) {
            console.log("staus is good.....");
            resolve(true);
          }
        });
      } catch (error) {
        console.log("Error is coming....");
        console.log(error);
        throw error;
      }
    });
  };

  cronJobs.prototype.createERSProject = async (
    projName,
    createdDate,
    email,
    projectManagerId
  ) => {
    let options = makeOptionsForERSCreateProject(
      projName,
      createdDate,
      email,
      projectManagerId
    );

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

  cronJobs.prototype.findJiraProjectInfo = async (jiraProjectId) => {
    let options = makeOptionsForFindJiraProjectInfo(jiraProjectId);
    return new Promise((resolve, reject) => {
      try {
        request(options, async (error, response) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode === 404) {
              resolve("Shakun Arora");
            } else {
              if (response.statusCode === 200) {
                resolve(response.body);
              }
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
