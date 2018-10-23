export default function (kibana) {
    return new kibana.Plugin({
        require: ['kibana', 'elasticsearch'],
        name: 'soc_workflow',
        id: 'soc_workflow',
        uiExports: {
            app: {
                title: 'SOC Workflow App CE',
                description: 'SOC Workflow Application Community Edition',
                main: 'plugins/soc_workflow/app',
                icon: 'plugins/soc_workflow/assets/img/applogo.svg'
            }
        },
        init: require('./init.js')
    });
}
