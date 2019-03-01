/**
 * @param currentStage
 * @returns {Array}
 */
module.exports = {
    all: {
        // Case
        'Open': '#E0E0E0',
        'Queued': '#E0E0E0',
        'Initial Review': '#BDBDBD',
        'Under Investigation': '#9E9E9E',
        'Closed': '#1B5E20',
        // Alerts
        'In Case': '#1B5E20',
    },
    available: function () {
        return [
            'Open',
            'Initial Review',
            'Under Investigation',
            'Closed'
        ];
    }
};