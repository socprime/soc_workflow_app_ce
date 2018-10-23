/**
 * @param href
 * @param localScope
 * @param $http
 * @param spCF
 */
module.exports = function (href, localScope, $http, spCF) {
    // Load playbooks
    $http({
        method: "GET",
        url: href + '/get-case-list-for-select',
        dataType: "json",
    }).then(function (response) {
        response = response['data'] || {};
        if (response.success && response.success == true) {
            response = response.data || [];
            response.forEach(function (oneCase) {
                if (spCF.isString(oneCase['id']) && spCF.isString(oneCase['name'])) {
                    localScope.caseList[oneCase['id']] = oneCase['name'];
                }
            });
        }
    }).catch(function (e) {
        console.log(e);
    });
};