/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const index = (req) => {
        return {
            success: true
        };
    };

    return {
        index: index
    };
};
