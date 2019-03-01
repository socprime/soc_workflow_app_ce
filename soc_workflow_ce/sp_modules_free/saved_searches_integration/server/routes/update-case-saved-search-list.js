/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        return {
            success: false
        };
    };

    return {
        index: index
    };
};
