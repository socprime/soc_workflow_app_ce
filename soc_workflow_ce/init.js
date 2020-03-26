const moduleFolder = require('./server/constant/module-folder');

/**
 * @param server
 * @param options
 */
export default function (server, options) {
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/alert-update',                           handler: (req,reply) => require('./server/routes/alert/update')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/alert-one-entity',                       handler: (req,reply) => require('./server/routes/alert/one-entity')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/alert-log-stage',                        handler: (req,reply) => require('./server/routes/alert/log-stage')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-update',                           handler: (req,reply) => require('./server/routes/case/update')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-one-entity',                       handler: (req,reply) => require('./server/routes/case/one-entity')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/cases-one-data',                         handler: (req,reply) => require('./server/routes/case/one-data')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/cases-log-stage',                        handler: (req,reply) => require('./server/routes/case/log-stage')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/cases-enrich-by-sigma',                  handler: (req,reply) => require('./server/routes/case/enrich-by-sigma')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/saved-search',                           handler: (req,reply) => require(`./${moduleFolder}/server/routes/event_share_link/get-saved-search`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/create-case',                            handler: (req,reply) => require('./server/routes/case/create')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-case-list-for-select',               handler: (req,reply) => require('./server/routes/case/get-list-for-select')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-events',                     handler: (req,reply) => require('./server/routes/case/update-case-events')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-saved-search-list',          handler: (req,reply) => require(`./${moduleFolder}/server/routes/saved_searches_integration/update-case-saved-search-list`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/update-case-graph-workspace-list',       handler: (req,reply) => require(`./${moduleFolder}/server/routes/graph_integration/update-graph-workspace-list`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-playbook',                           handler: (req,reply) => require('./server/routes/playbook/get')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/save-playbook',                          handler: (req,reply) => require(`./${moduleFolder}/server/routes/playbooks/save-playbook`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/delete-playbook',                        handler: (req,reply) => require(`./${moduleFolder}/server/routes/playbooks/delete-playbook`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-playbook-list-by-alert-ids',         handler: (req,reply) => require('./server/routes/playbook/get-list-by-alert-ids')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/enrich-data',                            handler: (req,reply) => require('./server/routes/common/enrich-data')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/event-update',                           handler: (req,reply) => require('./server/routes/event/update')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-same-alerts-events-fields-for-case', handler: (req,reply) => require('./server/routes/common/get-same-alerts-events-fields-for-case')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/sigmas-list',                            handler: (req,reply) => require('./server/routes/common/get-sigmas-list')(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-file',                               handler: (req,reply) => require('./server/routes/common/get-file')(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/ajax-update-channel-table',              handler: (req,reply) => require(`./${moduleFolder}/server/routes/channel_table/update-table`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/edit-sla-settings-data',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/sla_settings/get-data`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/edit-sla-settings-data',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/sla_settings/post-data`)(server, options).index(req,reply) });

    server.route({ method: 'POST', path: '/app/soc_workflow_ce/get-one-entity-mitre',                   handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-common/entity-mitre`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-cv-entities',                        handler: (req ,reply) => require(`./${moduleFolder}/server/routes/common/get-cv-entities`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/risks-users-update',                     handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-users/update`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/risks-users-one-entity',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-users/one-entity`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-one-user-forensics',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-users/forensics`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-one-user-timeline',                  handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-users/timeline`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/get-one-user-timeline-events',           handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-users/timeline-events`)(server, options).index(req,reply) });

    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/risks-hosts-update',                     handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-hosts/update`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/risks-hosts-one-entity',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-hosts/one-entity`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-one-host-forensics',                 handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-hosts/forensics`)(server, options).index(req,reply) });
    server.route({ method: 'GET',  path: '/app/soc_workflow_ce/get-one-host-timeline',                  handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-hosts/timeline`)(server, options).index(req,reply) });
    server.route({ method: 'POST', path: '/app/soc_workflow_ce/get-one-host-timeline-events',           handler: (req ,reply) => require(`./${moduleFolder}/server/routes/risks-hosts/timeline-events`)(server, options).index(req,reply) });
};
