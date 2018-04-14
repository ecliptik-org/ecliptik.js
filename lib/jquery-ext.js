if (typeof $ !== "undefined") {
    console.log($);
    $.fn.ecliptikSetup = function (_params) {
        if ($(this).find(".canvas").length == 0) {
            $(this).append("<div class=\"canvas\"></div>");
        }

        var canvas = $(this).find(".canvas");
        if (canvas.find('svg').length) {
            canvas.find('svg').remove();
        }
        var draw = SVG(canvas[0]);

        var width = $(this).width();
        draw.size(width, width);

        var params = new Params();
        if (_params == null) {
            console.log("no params for ecliptik");
            _params = $(this).attr('ecliptik-params')
            if (_params != null) {
                if (_params.charAt(0) === '#') {
                    _params = _params.replace('#', '')
                } else {
                    _params = JSON.parse(_params);
                }
            }
        }

        if (typeof _params === 'string') {
            params.fromUrlParam(_params)
        } else {
            params.copyFrom(_params);
        }

        paint(draw, params.sex, params.gender, params.orientation, params.sexChange, params.acceptSexChange, params.noOrientation);

        canvas.attr('title', params.fullDescription())
    }

    $.fn.ecliptik = function (_params) {
        $(this).each(function () {
            $(this).ecliptikSetup(_params);
        });
    }
}