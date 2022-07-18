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
  url: "https://app.eresourcescheduler.cloud/rest/v1/projects",

  contentType: "application/json",
  authorizationToken: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",

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

//---------------------------------Configuration required for Updating Tasks of ERS Project----------------------
exports.updateTasksOfERSProject = {
  contentType: "application/json",
  Authorization: "Bearer e0e1nhh5horvcvdkpss9hif89yu3d5",
  url: "https://app.eresourcescheduler.cloud/rest/v1/projects/?project_id/tasks/?task_id",
  method: "PUT",
};

//---------------------------------Configuration required for Finding Jira  Project Details----------------------
exports.findJiraProjDetails = {
  contentType: "application/json",
  Username: "nishant.sharma@rstartec.com",
  Password: "YiIEm16AP0hV3KL3fsff31FE",
  url: "https://sofbang.atlassian.net/rest/api/3/project/?project_id",
  method: "GET",
};

//------------------------------------------Project Leads Details-------------------------------------------------
exports.projectLeads = [
  {
    name: "Manmohan Sethi",
    id: 11701,
  },
  {
    name: "Khushboo Dhanani",
    id: 11696,
  },
  { name: "sameer Jain", id: 11739 },
  { name: "Babita Ribet", id: 11673 },
  { name: "Amit Joshi", id: 11664 },
  { name: "Aileen Roy", id: 11660 },
  { name: "Danny Asnani", id: 11679 },
  { name: "Shakun Arora", id: 11516 },
  { name: "Manvinder Chandhok", id: 11518 },
  { name: "Ravi Garg", id: 11734 },
  { name: "Michael Ribet", id: 11707 },
  { name: "Sohail Abbas", id: 11745 },
  {
    name: "Raghavendra",
    id: 11725,
  },
];
