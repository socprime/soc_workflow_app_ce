let fs = require('fs');
let path = require("path");

let emptyResult = {
    success: false
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        let query = req.query || {};
        let file = typeof query.file == "string" ? query.file : null;

        if (!file || !fs.existsSync(__dirname + file)) {
            return emptyResult;
        }

        try {
            let fileContent = fs.readFileSync(path.resolve(__dirname + file), 'utf8');

            return {
                success: true,
                text: fileContent,
            };
        } catch (e) {
            console.log(e);
            return emptyResult;
        }
    };

    return {
        index: index
    };
};
