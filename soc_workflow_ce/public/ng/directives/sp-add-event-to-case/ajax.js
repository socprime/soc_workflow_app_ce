/**
 * @param localScope
 * @param $http
 * @param spCF
 * @param casePeriod
 */
module.exports = function (localScope, $http, spCF, casePeriod) {
    // Load playbooks
    if (localScope.currUrl) {
        $http({
            method: "GET",
            url: localScope.currUrl + '/get-case-list-for-select',
            dataType: "json",
            params: {
                casePeriod: casePeriod
            }
        }).then(function (response) {
            response = response['data'] || {};
            if (response.success && response.success == true) {
                response = response.data || [];
                localScope.caseList = {};
                response.forEach(function (oneCase) {
                    if (spCF.isString(oneCase['id']) && spCF.isString(oneCase['name'])) {
                        localScope.caseList[oneCase['id']] = oneCase['name'];
                    }
                });
            }
        }).catch(function (e) {
            console.log(e);
        });
    }
};