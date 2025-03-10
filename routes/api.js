'use strict';
const { v4: uuidv4 } = require('uuid');

let localProjects = {};
localProjects['apitest']  = [];

const initIssue = {
  _id: uuidv4(),
  issue_title: 'Issue 1',
  issue_text: 'For Testing',
  created_on: new Date(),
  updated_on: new Date(),
  created_by: 'em-latic',
  assigned_to: 'em-latic',
  open: true,
  status_text: 'new'
}
localProjects['apitest'].push(initIssue);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const query = req.query;

      let projectData = localProjects[project];

      if(!projectData) {
        res.status(404).send('Project not found');
      }

      // If no query, return full data (all issues)
      if (Object.keys(query).length === 0) {
        return res.json(projectData);
      }

      let filteredData = projectData.filter(item => {
        // Check for all query parameters
        return Object.keys(query).every(key => {

          // Check: item has the key & value matches
          let queryVal = query[key];

          if (key === "open") {
            queryVal = query[key] === "true";
          }
          return item.hasOwnProperty(key) && item[key] == queryVal; //query[key];
        });
      });

      res.json(filteredData);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      //let inputData = req.body;
      
      const title = req.body.issue_title;
      const text = req.body.issue_text;
      const created_by = req.body.created_by;

      if(!title || !text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      
      const issue = {
        _id: uuidv4(),
        issue_title: title,
        issue_text: text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by,
        assigned_to: req.body.assigned_to,
        open: true,
        status_text: req.body.status_text
      }

      if(!localProjects[project]) {   //if project does not yet exist, create it
        localProjects[project] = [];
      }
      localProjects[project].push(issue);
      res.status(201).json(issue);
    })
    
    .put(function (req, res){
      let project = req.params.project;

      const reqBody = req.body;       //console.log(reqBody, 'length', Object.keys(reqBody).length);

      if(!reqBody._id) {
        res.json({ error: "missing _id" });
        return;
      }
      else if(!(Object.keys(reqBody).length > 1)) {
        res.json({ error: 'no update field(s) sent', _id: reqBody._id });
        return;
      }

      const updateIssue = {};
      for (const key in reqBody) {
        if (reqBody[key] !== "" && reqBody[key] !== undefined) {
          updateIssue[key] = reqBody[key];

          if(key=="open") {
            updateIssue[key] = (reqBody[key] === 'true');
          }
        }
      }
      updateIssue.updated_on = new Date();

      /* const updateIssue = {
        // created_on not modified in Update
        _id: req.body._id, issue_title: req.body.issue_title, issue_text: req.body.issue_text, updated_on: new Date(), 
        created_by: req.body.created_by, assigned_to: req.body.assigned_to, open: req.body.open, status_text: req.body.status_text
      } */

      let projectData = localProjects[project];
      if(!projectData) {  
        //res.status(404).send("Project not found");
        res.json({ error: 'could not update', _id: reqBody._id });
        console.log('error: Project not found');
        return;
      }
      const issueIndex = projectData.findIndex(item => item._id === updateIssue._id);
      if (issueIndex === -1) {
        //return res.status(404).json({ error: 'Item not found' });
        res.json({ error: 'could not update', _id: reqBody._id });
        console.log('error: Item not found');
        return;
      }

      // Update the item using spread op. (...)
      projectData[issueIndex] = { ...projectData[issueIndex], ...updateIssue };
      res.json({ result: "successfully updated", _id: updateIssue._id });
    })
    

    .delete(function (req, res){
      let project = req.params.project;
      let deleteItemId = req.body._id;

      if(!deleteItemId) {
        res.status(404).json({ error: 'missing _id' });
        return;
      }

      let projectData = localProjects[project];
      if(!projectData) {  
        //res.status(404).send("Project not found");
        res.status(404).json({ error: 'could not delete', _id: deleteItemId });
        console.log('error: Project not found');
        return;
      }
      const issueIndex = projectData.findIndex(item => item._id === deleteItemId);

      if (issueIndex === -1) {
        //return res.status(404).json({ error: 'Item not found' });
        res.status(404).json({ error: 'could not delete', _id: deleteItemId });
        console.log('error: Item not found');
        return;
      }

      //Delete item in project array using 'splice'
      projectData.splice([issueIndex], 1);
      res.json({result: "successfully deleted", _id: deleteItemId });
    });
    
};
