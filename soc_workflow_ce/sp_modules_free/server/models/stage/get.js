let forCase = {
    'Open': '#E0E0E0',
    'Queued': '#E0E0E0',
    'Initial Review': '#BDBDBD',
    'Under Investigation': '#9E9E9E',
    'Closed': '#1B5E20',
};

let forAlert = {
    'Queued': '#E0E0E0',
    'In Case': '#1B5E20'
};

/**
 * @param currentStage
 * @returns {Array}
 */
module.exports = {
    all: Object.assign({}, forCase, forAlert),
    forCase: forCase,
    firstForCase: 'Queued',
    firstForAlert: 'Queued',
    forAlert: forAlert,
    forCaseClosed: [
        'Closed'
    ],
    forAlertClosed: [
        'In Case'
    ],
    available: function () {
        return Object.keys(this.all);
    }
};