//-----------------------------Configuration Required for Fetching Jira Records---------------------------------
exports.fetchingJiraRecords = {
  contentType: "application/json",
  authorizationToken:
    "Basic bmVldGlrYS5tYWRhYW5Ac29mYmFuZy5jb206N1hxU2tpSFpLTDlUMldVYmFzdE9GNTc1",
  jiraURL: "https://sofbang.atlassian.net/rest/api/3/search",
  method: "POST",
};

//-------------------------- Configuration required for Creating ERS Project-------------------------------------

exports.creatingERSProject = {
  // url: "https://app.eresourcescheduler.cloud/rest/v1/projects",
  url: "https://app.eresourcescheduler.cloud/rest/v1/projectsssssss",
  contentType: "application/json",
  // authorizationToken: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",
  authorizationToken: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d50000000000000",
  projectType: { standard: 1 },
  udfBillingStatus: { billable: 334, noBillable: 336 },
  method: "POST",
};

//-----------------------------------Configuraion Required for Creating Tasks in ERS Project-------------------

exports.creatingERSProjectsTask = {
  contentType: "application/json",
  Authorization: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",
  url: "https://app.eresourcescheduler.cloud/rest/v1/projects/?project_id/tasks",
  method: "POST",
};

//-----------------------------------Configuraion Required for Get All Projects in ERS-------------------------

exports.getAllERSProjects = {
  contentType: "application/json",
  Authorization: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",
  url: "https://app.eresourcescheduler.cloud/rest/v1/projects?offset=?offset_val&limit=?total_limit",
  method: "GET",
};

//---------------------------------Configuration required for Getting Tasks of ERS Project----------------------
exports.getTasksOfERSProject = {
  contentType: "application/json",
  Authorization: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",
  url: "https://app.eresourcescheduler.cloud/rest/v1/projects/?project_id/tasks",
  method: "GET",
};
