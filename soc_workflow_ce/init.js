let moduleFolder = require('./server/constant/module_folder');

let AlertUpdateTable =                 require('./server/routes/alert/update-table');
let AlertUpdate =                      require('./server/routes/alert/update');
let AlertOneEntity =                   require('./server/routes/alert/one-entity');
let AlertLogStage =                    require('./server/routes/alert/log-stage');
let CasesUpdateTable =                 require('./server/routes/case/update-table');
let CasesUpdate =                      require('./server/routes/case/update');
let CasesOneEntity =                   require('./server/routes/case/one-entity');
let CasesOneData =                     require('./server/routes/case/one-data');
let CasesLogStage =                    require('./server/routes/case/log-stage');
let CasesEnrichBySigma =               require('./server/routes/case/enrich-by-sigma');
let CreateCase =                       require('./server/routes/case/create');
let GetCaseListForSelect =             require('./server/routes/case/get-list-for-select');
let UpdateCaseEvents =                 require('./server/routes/case/update-case-events');
let GetPlaybook =                      require('./server/routes/playbook/get');
let GetPlaybookListByAlertIds =        require('./server/routes/playbook/get-list-by-alert-ids');
let GetEnrichData =                    require('./server/routes/common/enrich-data');
let EventsUpdate =                     require('./server/routes/event/update');
let GetSameAlertsEventsFieldsForCase = require('./server/routes/common/get-same-alerts-events-fields-for-case');
let GetSavedSearchListByCaseId =       require('./server/routes/saved-search/get-list-by-case-id');
let GetSigmasList =                    require('./server/routes/common/get-sigmas-list');
let GetFile =                          require('./server/routes/common/get-file');

// Modules route
let SavedSearch =                      require('./' + moduleFolder + '/event_share_link/server/routes/get-saved-search');
let UpdateCaseGraphWorkspaceList =     require('./' + moduleFolder + '/graph_integration/server/routes/update-graph-workspace-list');
let UpdateCaseSavedSearchList =        require('./' + moduleFolder + '/saved_searches_integration/server/routes/update-case-saved-search-list');
let SavePlaybook =                     require('./' + moduleFolder + '/playbooks/server/routes/save-playbook');
let DeletePlaybook =                   require('./' + moduleFolder + '/playbooks/server/routes/delete-playbook');

/**
 * @param server
 * @param options
 */
export default function (server, options) {
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/alert-update-table',                        handler: (req,reply) => AlertUpdateTable(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/alert-update',                              handler: (req,reply) => AlertUpdate(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/alert-one-entity',                          handler: (req,reply) => AlertOneEntity(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/alert-log-stage',                           handler: (req,reply) => AlertLogStage(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/cases-update-table',                        handler: (req,reply) => CasesUpdateTable(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-update',                              handler: (req,reply) => CasesUpdate(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-one-entity',                          handler: (req,reply) => CasesOneEntity(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-one-data',                            handler: (req,reply) => CasesOneData(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/cases-log-stage',                           handler: (req,reply) => CasesLogStage(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/cases-enrich-by-sigma',                     handler: (req,reply) => CasesEnrichBySigma(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/saved-search',                              handler: (req,reply) => SavedSearch(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/create-case',                               handler: (req,reply) => CreateCase(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-case-list-for-select',                  handler: (req,reply) => GetCaseListForSelect(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-events',                        handler: (req,reply) => UpdateCaseEvents(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-saved-search-list',             handler: (req,reply) => UpdateCaseSavedSearchList(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-graph-workspace-list',          handler: (req,reply) => UpdateCaseGraphWorkspaceList(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-playbook',                              handler: (req,reply) => GetPlaybook(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/save-playbook',                             handler: (req,reply) => SavePlaybook(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/delete-playbook',                           handler: (req,reply) => DeletePlaybook(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-playbook-list-by-alert-ids',            handler: (req,reply) => GetPlaybookListByAlertIds(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/enrich-data',                               handler: (req,reply) => GetEnrichData(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/event-update',                              handler: (req,reply) => EventsUpdate(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-same-alerts-events-fields-for-case',    handler: (req,reply) => GetSameAlertsEventsFieldsForCase(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-saved-search-list-by-case-id',          handler: (req,reply) => GetSavedSearchListByCaseId(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/sigmas-list',                               handler: (req,reply) => GetSigmasList(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-file',                                  handler: (req,reply) => GetFile(server, options).index(req,reply) });
};
