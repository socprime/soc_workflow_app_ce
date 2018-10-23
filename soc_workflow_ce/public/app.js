import uiRoutes from 'ui/routes';

require('ui/autoload/all');
require('ui/chrome');

import * as d3 from 'd3';
window.d3 = d3;

import * as c3 from 'c3';
window.c3 = c3;

import katex from 'katex';
window.katex = katex;

import Quill from 'quill';
window.Quill = Quill;

// Include assets
import './assets/css/reset.css';
import './assets/plugins/bootstrap/bootstrap.min.css';

// DataTables
import './assets/plugins/datatables/dataTables.bootstrap4.min.css';
import './assets/plugins/datatables/buttons.bootstrap4.min.css';
// Responsive datatable
import './assets/plugins/datatables/responsive.bootstrap4.min.css';
import './assets/plugins/font-awesome/css/font-awesome.min.css';
import './assets/plugins/datepicker/daterangepicker.css';
import './../node_modules/katex/dist/katex.min.css';
import './../node_modules/quill/dist/quill.snow.css';
import './assets/css/quill.socworkflow.css';
import './assets/plugins/select2/select2.css';
import './assets/css/sidebar.css';
import './assets/plugins/c3/c3.css';
import './assets/css/menu-button.css';
import './assets/css/style.css';
import './assets/css/style-light.css';

import './assets/js/jquery-2.1.1.js';
import './assets/plugins/bootstrap/bootstrap.min.js';
// Required datatable js
import './assets/plugins/datatables/jquery.dataTables.min.js';
import './assets/plugins/datatables/dataTables.bootstrap4.js';
import './assets/dataTables.responsive.js';

import './assets/plugins/select2/select2.js';
import './assets/js/main.js';

import './assets/js/customCharts.js';

let moduleFolder = require('../server/constant/module_folder');
// require SOC Workflow modules
//- Event Share Link
require('./../' + moduleFolder + '/event_share_link/public/directives/sp-events-saved-search/index');
//- Machine Learning Integration
require('./../' + moduleFolder + '/ml_integration/public/services/add');
//- Graph Integration
require('./../' + moduleFolder + '/graph_integration/public/directives/sp-edit-case-graph-workspace/index');
require('./../' + moduleFolder + '/graph_integration/public/services/add');
require('./../' + moduleFolder + '/graph_integration/public/services/edit');
//- Saved Search Integrations
require('./../' + moduleFolder + '/saved_searches_integration/public/directives/sp-edit-case-saved-search/index');
require('./../' + moduleFolder + '/saved_searches_integration/public/services/edit');
require('./../' + moduleFolder + '/saved_searches_integration/public/directives/sp-saved-search-integration-create-case/index');
require('./../' + moduleFolder + '/saved_searches_integration/public/services/save');
//- Playbooks
require('./../' + moduleFolder + '/playbooks/public/directives/sp-all-playbooks/index');
require('./../' + moduleFolder + '/playbooks/public/directives/sp-edit-playbook/index');
//- Upload to Anomali My Attacks
require('./../' + moduleFolder + '/anomali_threatstream_enrichment/public/services/upload');

// require SOC Workflow services
//- config
require('./ng/services/config/cases-table');
require('./ng/services/config/alerts-table');
require('./ng/services/config/events-table');
require('./ng/services/config/period');
//- common
require('./ng/services/common/function');
require('./ng/services/common/switch-theme');
require('./ng/services/common/modal');
require('./ng/services/common/get-range-from-picker');
//- init common
require('./ng/services/init/common/date-range-picker');
require('./ng/services/init/method/common');
//- init chart
require('./ng/services/init/chart/donut');
require('./ng/services/init/chart/timeline');
//- cases
require('./ng/services/init/cases/action');
require('./ng/services/init/cases/page');
require('./ng/services/init/cases/ajax');
//- one-case
require('./ng/services/init/one-case/ajax');
require('./ng/services/init/one-case/page');
require('./ng/services/init/one-case/action');
//- alerts
require('./ng/services/init/alerts/page');
require('./ng/services/init/alerts/ajax');
//- one-alert
require('./ng/services/init/one-alert/ajax');
require('./ng/services/init/one-alert/page');
require('./ng/services/init/one-alert/action');
//- events
require('./ng/services/init/events/action');
require('./ng/services/init/events/page');
require('./ng/services/init/events/ajax');

// require SOC Workflow directives
require('./ng/directives/sp-top-nav/index');
require('./ng/directives/sp-select2/index');
require('./ng/directives/sp-compile/index');
require('./ng/directives/sp-show-playbook/index');
require('./ng/directives/sp-period-switch/index');
require('./ng/directives/sp-chart/index');
require('./ng/directives/sp-chanel-table/index');
require('./ng/directives/sp-case-fixed-menu/index');
require('./ng/directives/sp-create-case/index');
require('./ng/directives/sp-process-case/index');
require('./ng/directives/sp-alert-fixed-menu/index');
require('./ng/directives/sp-add-event-to-case/index');
require('./ng/directives/sp-enrich-with-sigma/index');
require('./ng/directives/sp-data-action-button/index');
require('./ng/directives/sp-footer/index');

// require SOC Workflow constrollers
require('./ng/controllers/cases');
require('./ng/controllers/one-case');
require('./ng/controllers/alerts');
require('./ng/controllers/one-alert');
require('./ng/controllers/events');

uiRoutes.enable();
uiRoutes.when('/cases', {
    template: require('./ng/views/cases.html'),
    reloadOnSearch: false
});
uiRoutes.when('/cases/:caseId', {
    template: require('./ng/views/one-case.html'),
    reloadOnSearch: false
});
uiRoutes.when('/alerts', {
    template: require('./ng/views/alerts.html'),
    reloadOnSearch: false
});
uiRoutes.when('/alerts/:alertId', {
    template: require('./ng/views/one-alert.html'),
    reloadOnSearch: false
});
uiRoutes.when('/events', {
    template: require('./ng/views/events.html'),
    reloadOnSearch: false
});
uiRoutes.otherwise({
    redirectTo: '/cases'
});
