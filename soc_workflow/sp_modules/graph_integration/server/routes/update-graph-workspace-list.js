export default function (server, options) {
    const index = (req, reply) => {
        return reply({
		    success: false
		});
    };

    return {
        index: index
    };
};
