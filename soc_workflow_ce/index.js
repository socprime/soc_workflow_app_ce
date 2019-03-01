export default function (kibana) {
    return new kibana.Plugin({
        require: ['kibana', 'elasticsearch'],
        name: 'soc_workflow_ce',
        id: 'soc_workflow_ce',
        uiExports: {
            app: {
                title: 'SOC Workflow CE App',
                description: 'SOC Workflow CE Application',
                main: 'plugins/soc_workflow_ce/app',
                icon: 'plugins/soc_workflow_ce/assets/img/applogo.svg'
            }
        },
        init: require('./init.js')
    });
}
