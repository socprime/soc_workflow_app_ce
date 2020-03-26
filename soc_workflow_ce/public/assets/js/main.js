$(document).ready(function () {
    $.fn.waitAnimationStart = function (params) {
        params = params || {};

        let zIndex = params.zIndex ? params.zIndex : undefined;
        let pulseSize = params.pulseSize ? params.pulseSize : '36';
        let backgroundTransparent = params.backgroundTransparent ? params.backgroundTransparent : false;

        $(this).prepend('' +
            '<div align="center" class="animation-image-overlay" style="' + (zIndex !== undefined ? 'z-index: ' + zIndex : '') + '; ' + (backgroundTransparent ? 'background-color: transparent' : '') + '">' +
            '<div align="center" class="animation-image">' +
            '<i class="fa fa-spinner fa-pulse" style="font-size: ' + pulseSize + 'px;"></i>' +
            '</div>' +
            '</div>' +
            '');

        let parentContainerHeight = $(this).outerHeight();

        $(this).find('.animation-image').css({
            'margin-top': parseInt(parentContainerHeight / 2 - (parseInt(pulseSize) / 2)) + 'px'
        });

        $(this).find('.animation-image-overlay').css({
            'height': parentContainerHeight + 'px'
        });
    };

    $.fn.waitAnimationStop = function () {
        $(this).find('.animation-image-overlay').detach();
        $(this).find('.animation-image').detach();
    };

    $('body').on('click', '.modal [data-label=Close], .modal [data-label=Save]', function (e) {
        $('body').removeClass('modal-open');
    })
});