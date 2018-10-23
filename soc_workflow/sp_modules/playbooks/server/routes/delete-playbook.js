export default function (server, options) {
    const index = (req, reply) => {
        return reply({
            success: true
        });
    };

    return {
        index: index
    };
};
