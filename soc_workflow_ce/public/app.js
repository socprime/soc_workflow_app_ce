let moment = require('moment-timezone');

import uiRoutes from 'ui/routes';

require('ui/autoload/all');
require('ui/chrome');

// HTML templates
import viewsCases from './ng/views/cases.html';
import viewsOneCase from './ng/views/one-case.html';
import viewsAlerts from './ng/views/alerts.html';
import viewsOneAlert from './ng/views/one-alert.html';
import viewsEvents from './ng/views/events.html';
import viewsRisksUsers from './ng/views/risks-users.html';
import viewsRisksOneUser from './ng/views/risks-one-user.html';
import viewsRisksHosts from './ng/views/risks-hosts.html';
import viewsRisksOneHost from './ng/views/risks-one-host.html';

import * as d3 from 'd3';
import * as c3 from 'c3';

setTimeout(() => {
    window.d3 = d3;
    window.c3 = c3;
});

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
import './assets/css/app.css';

import './assets/js/jquery-2.1.1.js';
import './assets/plugins/bootstrap/bootstrap.min.js';

// Required datatable js
import './assets/plugins/datatables/jquery.dataTables.min.js';
import './assets/plugins/datatables/dataTables.bootstrap4.js';
import './assets/dataTables.responsive.js';

import './assets/plugins/select2/select2.js';
import './assets/js/main.js';

import './assets/js/customCharts.js';

const moduleFolder = require('../server/constant/module-folder');
// require SOC Workflow modules
//- top_nav
require(`./../${moduleFolder}/public/directives/sp-top-nav/index`);
//- Event Share Link
require(`./../${moduleFolder}/public/directives/sp-events-saved-search/index`);
//- Machine Learning Integration
require(`./../${moduleFolder}/public/services/ml_integration/add`);
//- Graph Integration
require(`./../${moduleFolder}/public/directives/sp-edit-case-graph-workspace/index`);
require(`./../${moduleFolder}/public/services/graph_integration/add`);
require(`./../${moduleFolder}/public/services/graph_integration/edit`);
//- Saved Search Integrations
require(`./../${moduleFolder}/public/directives/sp-edit-case-saved-search/index`);
require(`./../${moduleFolder}/public/directives/sp-saved-search-integration-create-case/index`);
require(`./../${moduleFolder}/public/services/saved_searches_integration/edit`);
require(`./../${moduleFolder}/public/services/saved_searches_integration/save`);
//- Playbooks
require(`./../${moduleFolder}/public/directives/sp-all-playbooks/index`);
require(`./../${moduleFolder}/public/directives/sp-edit-playbook/index`);
//- Upload to Anomali My Attacks
require(`./../${moduleFolder}/public/services/anomali_threatstream_enrichment/upload`);
//- channel_table
require(`./../public/ng/directives/sp-channel-table/index`);

require(`./../public/ng/services/config/table`);
require(`./../public/ng/services/config/case-table`);
require(`./../public/ng/services/config/alert-table`);
require(`./../public/ng/services/channel_table/get-table-fields`);
require(`./../public/ng/services/channel_table/update-table`);
//- sla_settings
require(`./../${moduleFolder}/public/directives/sp-edit-sla-settings/index`);

// require SOC Workflow from module
if (moduleFolder == 'sp_modules') {
    require(`./../${moduleFolder}/public/services/init/risks-users/page`);
    require(`./../${moduleFolder}/public/services/init/risks-users/action`);
    require(`./../${moduleFolder}/public/services/config/risks-users-table`);
    require(`./../${moduleFolder}/public/services/init/one-risks-user/page`);
    require(`./../${moduleFolder}/public/services/init/one-risks-user/action`);
    require(`./../${moduleFolder}/public/directives/sp-search-cv-entity/index`);
    require(`./../${moduleFolder}/public/directives/sp-one-user-forensics/index`);
    require(`./../${moduleFolder}/public/directives/sp-one-user-timeline/index`);

    require(`./../${moduleFolder}/public/services/init/risks-hosts/page`);
    require(`./../${moduleFolder}/public/services/init/risks-hosts/action`);
    require(`./../${moduleFolder}/public/services/config/risks-hosts-table`);
    require(`./../${moduleFolder}/public/services/init/one-risks-host/page`);
    require(`./../${moduleFolder}/public/services/init/one-risks-host/action`);
    require(`./../${moduleFolder}/public/directives/sp-one-host-forensics/index`);
    require(`./../${moduleFolder}/public/directives/sp-one-host-timeline/index`);
}

// require SOC Workflow services
//- config
require('./ng/services/config/events-table');
require('./ng/services/config/period');
//- common
require('./ng/services/common/function');
require('./ng/services/common/switch-theme');
require('./ng/services/common/modal');
require('./ng/services/common/get-range-from-picker');
//- init common
require('./ng/services/init/common/date-range-picker');
require('./ng/services/init/common/update-date-range-from-picker');
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
require('./ng/directives/sp-select2/index');
require('./ng/directives/sp-compile/index');
require('./ng/directives/sp-show-playbook/index');
require('./ng/directives/sp-period-switch/index');
require('./ng/directives/sp-chart/index');
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
require('./ng/controllers/risks-users');
require('./ng/controllers/risks-one-user');
require('./ng/controllers/risks-hosts');
require('./ng/controllers/risks-one-host');

// Add headers to all ajax request
require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize'])
    .run([
        '$http',
        function ($http) {
            // Add client timezone
            $http.defaults.headers.common['clienttimezone'] = moment.tz.guess();
            $http.defaults.headers.common['clienttimezone'] = typeof $http.defaults.headers.common['clienttimezone'] == 'string' ?
                $http.defaults.headers.common['clienttimezone'] : "UTC";
        }])
    .filter('isNotEmpty', function () {
        return function (obj) {
            let bar;
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return true;
                }
            }
            return false;
        };
    })
    .filter('objectCount', function () {
        return function (obj) {
            return Object.keys(obj).length;
        };
    })
    .filter('beautifyName', ['spCF', function (spCF) {
        return function (name) {
            return spCF.beautifyName(name);
        };
    }])
    .filter('range', function () {
        return function (input, total) {
            total = parseInt(total);

            for (var i = 0; i < total; i++) {
                input.push(i);
            }

            return input;
        };
    })
    .filter('textToSlug', function () {
        return function (text) {
            return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
        };
    })
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseFloat(value);
                });
            }
        };
    });

uiRoutes.enable();
uiRoutes.when('/cases', {
    template: viewsCases,
    reloadOnSearch: false
});
uiRoutes.when('/cases/:caseId', {
    template: viewsOneCase,
    reloadOnSearch: false
});
uiRoutes.when('/alerts', {
    template: viewsAlerts,
    reloadOnSearch: false
});
uiRoutes.when('/alerts/:alertId', {
    template: viewsOneAlert,
    reloadOnSearch: false
});
uiRoutes.when('/events', {
    template: viewsEvents,
    reloadOnSearch: false
});

if (moduleFolder == 'sp_modules') {
    uiRoutes.when('/risks-users', {
        template: viewsRisksUsers,
        reloadOnSearch: false
    });
    uiRoutes.when('/risks-user/:userId', {
        template: viewsRisksOneUser,
        reloadOnSearch: false
    });
    uiRoutes.when('/risks-hosts', {
        template: viewsRisksHosts,
        reloadOnSearch: false
    });
    uiRoutes.when('/risks-host/:hostId', {
        template: viewsRisksOneHost,
        reloadOnSearch: false
    });
}

uiRoutes.otherwise({
    redirectTo: '/cases'
});
