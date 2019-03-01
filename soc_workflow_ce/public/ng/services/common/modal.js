/**
 * https://www.ovais.me/javascript/bootstrap-3-modal-easy-way/
 */

/**
 * @param $scope
 * @param $compile
 * @param html
 * @returns {*}
 */
const prepareElement = function ($scope, $compile, html) {
    let template = angular.element(html);
    let linkFn = $compile(template);

    return linkFn($scope);
};

require('ui/modules').get('app/soc_workflow_ce', [])
    .service('modal', ['$compile', function ($compile) {
        return {
            show: function ($scope, options) {
                let self = this;

                $('body').removeClass('modal-open');
                $('.modal').remove();
                $('.modal-backdrop').remove();
                self.$modal = undefined;

                options = $.extend({
                    title: '',
                    body: '',
                    remote: false,
                    backdrop: 'static',
                    size: false,
                    onShow: false,
                    onHide: false,
                    actions: false,
                    parentDiv: '.app-container',
                }, options);

                self.onShow = typeof options.onShow == 'function' ? options.onShow : function () {
                };
                self.onHide = typeof options.onHide == 'function' ? options.onHide : function () {
                };

                if (self.$modal == undefined) {
                    self.$modal = prepareElement($scope, $compile, '<div class="modal"><div class="modal-dialog"><div class="modal-content"></div></div></div>');

                    $(options.parentDiv).append(self.$modal);
                    self.$modal.on('shown.bs.modal', function (e) {
                        self.onShow.call(this, e);
                    });
                    self.$modal.on('hidden.bs.modal', function (e) {
                        self.onHide.call(this, e);
                    });
                }

                let modalClass = {
                    small: "modal-sm",
                    large: "modal-lg",
                    xlarge: "modal-lg-big"
                };

                self.$modal.data('bs.modal', false);
                self.$modal.find('.modal-dialog').removeClass().addClass('modal-dialog ' + (modalClass[options.size] || ''));
                self.$modal.find('.modal-content').html('');
                self.$modal.find('.modal-content').append(prepareElement(
                    $scope, $compile,
                    '<div class="modal-header"><h5 class="modal-title">' + options.title + '</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body">' + options.body + '</div><div class="modal-footer"></div>'
                ));

                let footer = self.$modal.find('.modal-footer');
                if (Object.prototype.toString.call(options.actions) == "[object Array]") {
                    for (let i = 0, l = options.actions.length; i < l; i++) {
                        options.actions[i].onClick = typeof options.actions[i].onClick == 'function' ? options.actions[i].onClick : function () {};
                        options.actions[i].label = options.actions[i].label || '{Label Missing!}';
                        options.actions[i].savingLabel = options.actions[i].savingLabel || false;
                        let buttonHtml = '';
                        buttonHtml += '<button type="button" ';
                        buttonHtml += 'class="btn ' + (options.actions[i].cssClass || '') + '" ';
                        buttonHtml += 'data-label="' + options.actions[i].label + '" ';
                        buttonHtml += (options.actions[i].savingLabel ? 'data-saving="' + options.actions[i].savingLabel + '" ' : ' ');
                        buttonHtml += '>';
                        buttonHtml += options.actions[i].label;
                        buttonHtml += '</button>';

                        $(buttonHtml).appendTo(footer).on('click', options.actions[i].onClick);
                    }
                } else {
                    $('<button type="button" class="btn btn-outline-danger" data-dismiss="modal">Close</button>').appendTo(footer);
                }

                self.$modal.modal(options);
            }
        };
    }]);
