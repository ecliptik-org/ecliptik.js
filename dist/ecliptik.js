if (typeof  $ === "undefined") {
    $ = {};
}

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
function Params() {
    this.sex = Math.random() * 2. - 1;
    this.gender = Math.random() * 2. - 1;
    this.orientation = Math.random() * 2. - 1;
    this.sexChange = false;
    this.acceptSexChange = true;
    this.noOrientation = false;
}

Params.prototype.copyFrom = function (other) {
    if (other == null)
        return;
    if (other.sex != null)
        this.sex = other.sex;
    if (other.gender != null)
        this.gender = other.gender;
    if (other.orientation != null)
        this.orientation = other.orientation;
    if (other.sexChange != null)
        this.sexChange = other.sexChange;
    if (other.acceptSexChange != null)
        this.acceptSexChange = other.acceptSexChange;
    if (other.noOrientation != null)
        this.noOrientation = other.noOrientation;
}

function isSet(val, bit) {
    if ((val & (1 << bit)) > 0)
        return 1;
    else
        return 0;
}

function combineBits(source, indices) {
    var shiftCount = indices.length - 1;
    var result = 0;
    var i;
    for (i = 0; i < indices.length; i++) {
        result |= isSet(source, indices[i]) << i;
    }

    var maxVal = (1 << indices.length) - 1;
    return (result / (maxVal * .5) - 1.);
}

function shuffleBits(value, indices) {
    var result = 0;
    var maxValue = (1 << indices.length) - 1;
    var intValue = Math.round((value + 1.) * maxValue * .5);

    var i = 0;
    for (i = 0; i < indices.length; i++) {
        result |= isSet(intValue, i) << indices[i];
    }

    return result;
}

function base64AddPadding(str) {
    return str + Array((4 - str.length % 4) % 4 + 1).join('=');
}

String.prototype.hexEncode = function () {
    var hex, i;
    var result = "";
    for (i = 0; i < this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += (hex);
    }
    return result
};

Params.prototype.fromUrlParam = function (base64) {
    base64 = base64.replace(/_/g, '/').replace(/-/g, '+');
    base64 = base64AddPadding(base64);
    if (typeof window === "undefined") {
        var data = new Buffer(base64, 'base64');
        var urlParam = parseInt(data.toString('hex'), 16);
    } else {
        var data = atob(base64);
        var urlParam = parseInt(data.hexEncode(), 16);
    }
    urlParam = urlParam & 0xFFFFFFFF;
    var version = (urlParam >> 31) | (urlParam >> 30);
    if (version != 0) {
        console.log("unknown url params version");
    }
    this.sex = combineBits(urlParam, [8, 4, 21, 17, 12, 19, 5, 29, 10]);
    this.gender = combineBits(urlParam, [27, 1, 25, 6, 3, 14, 15, 22, 26]);
    this.orientation = combineBits(urlParam, [2, 0, 18, 28, 9, 23, 11, 20, 24]);
    this.sexChange = isSet(urlParam, 7) ? true : false;
    this.acceptSexChange = isSet(urlParam, 16) ? true : false;
    this.noOrientation = isSet(urlParam, 13) ? true : false;
};

var toBytesInt32 = function (num) {
    var ascii = '';
    for (var i = 3; i >= 0; i--) {
        ascii += String.fromCharCode((num >> (8 * i)) & 255);
    }
    return ascii;
};


Params.prototype.toUrlParam = function () {
    var result = 0;
    result |= shuffleBits(this.sex, [8, 4, 21, 17, 12, 19, 5, 29, 10]);
    result |= shuffleBits(this.gender, [27, 1, 25, 6, 3, 14, 15, 22, 26]);
    result |= shuffleBits(this.orientation, [2, 0, 18, 28, 9, 23, 11, 20, 24]);
    result |= ((this.sexChange == true ? 1 : 0) << 7);
    result |= ((this.acceptSexChange == true ? 1 : 0) << 16);
    result |= ((this.noOrientation == true ? 1 : 0) << 13);
    result = toBytesInt32(result);
    return btoa(result).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, "");
};

function absPercentText(value, leftPole, rightPole) {
    var poleName = (value < 0) ? leftPole : rightPole;
    return Math.round(Math.abs(value) * 50 + 50) + "% " + poleName;
}

Params.prototype.sexDescription = function () {
    var suffix = (this.sexChange == true) ? " (had sex change)" : "";
    return absPercentText(this.sex, "female", "male") + suffix;
}

Params.prototype.genderDescription = function () {
    return absPercentText(this.gender, "woman", "man");
}

Params.prototype.orientationDescription = function () {
    if (this.noOrientation) {
        return "none";
    }
    var suffix = (this.acceptSexChange == true) ? " (opt. sex change)" : "";
    return absPercentText(this.orientation, "female", "male") + suffix;
}

Params.prototype.fullDescription = function () {
    var result = "";
    result += "Sex: " + this.sexDescription();
    result += "\nGender: " + this.genderDescription();
    result += "\nOrientation: " + this.orientationDescription();

    return result;
};

module.exports = Params;
function radiusFromSex(sex, arcHeight) {
    sex = Math.abs(sex);

    var radius = 10000;
    if (sex > 0) {
        radius = arcHeight / 2.;
        if (sex < 1) {
            var d = sex * arcHeight / 2.;
            radius = (arcHeight * arcHeight) / (8 * d) + d / 2.;
        }
    }

    return radius;
}

function calcArrowTransform(radius, gender, arcHeight) {
    var angleTop = Math.asin(arcHeight / 2. / radius);
    var angle = gender * angleTop;
    var centerY = Math.sin(angleTop) * radius;
    var centerX = -Math.cos(angleTop) * radius;

    return {
        angle: angle,
        rotationCenter: {
            x: centerX,
            y: centerY
        }
    };
}

function drawArc(draw, color, offset, sex, arcHeight, lineWidth) {
    var sexDirection = 0;
    if (sex >= 0)
        sexDirection = 1;
    radius = radiusFromSex(sex, arcHeight);
    var arcOffset = {
        x: offset.x,
        y: offset.y
    };
    if (sexDirection == 0) {
        arcOffset.x += sex * arcHeight / 2.;
    }

    var path = draw.path('M0 0 A' + radius + ' ' + radius + ' 0 0 ' + sexDirection + ' 0 ' + arcHeight);
    path.fill('none').move(arcOffset.x, arcOffset.y);
    path.stroke({
        color: color,
        width: lineWidth,
        linecap: 'square'
    });
}

function drawArrow(draw, color, offset, sex, gender, sexChange, arcHeight, lineWidth, inside) {
    var radToDeg = 180 / 3.1415;
    var radius = radiusFromSex(sex, arcHeight);
    var arrowTransform = calcArrowTransform(radius, gender, arcHeight);
    arrowTransform.rotationCenter.x += offset.x;
    if (sex < 0) {
        arrowTransform.rotationCenter.x += sex * arcHeight / 2.;
    }
    arrowTransform.rotationCenter.y += offset.y;

    var arrowLength = arcHeight * .3
    var sexChangeLineLength = arrowLength * .4;

    var path;
    if (sexChange == true) {
        var sexChangeOffset = ((sex < 0 ^ !inside) ? .55 : .45);

        path = draw.path('M ' + '0' + ' ' + '0' + ' H' + arrowLength +
            ' M ' + arrowLength * sexChangeOffset + ' ' + sexChangeLineLength + ' V' + -sexChangeLineLength);
    } else {
        path = draw.path('M ' + '0' + ' ' + '0' + ' H' + arrowLength);
    }

    if (sex < 0) {
        path.move(arrowTransform.rotationCenter.x + radius + sex * arcHeight * .5 - (inside ? 0 : arrowLength),
            arrowTransform.rotationCenter.y + (sexChange ? -sexChangeLineLength : 0));
        arrowTransform.angle = -arrowTransform.angle;
        path.rotate(arrowTransform.angle * radToDeg,
            arrowTransform.rotationCenter.x + 2 * radius - arcHeight / 2. * Math.abs(sex),
            arrowTransform.rotationCenter.y);
    } else {
        path.move(arrowTransform.rotationCenter.x + radius - (inside ? arrowLength : 0),
            arrowTransform.rotationCenter.y + (sexChange ? -sexChangeLineLength : 0));
        path.rotate(arrowTransform.angle * radToDeg, arrowTransform.rotationCenter.x,
            arrowTransform.rotationCenter.y);
    }
    path.fill('none');
    path.stroke({
        color: color,
        width: lineWidth
    });
}


function paint(draw, sex, gender, orientation, sexChange, acceptSexChange, noOrientation) {
    if (typeof window === "undefined") {
        draw.viewbox(40, 5, 120, 120);
    } else {
        draw.viewbox(40, 10, 120, 110);
    }
    draw.clear();
    var arcHeight = 70;
    var offset = {
        x: 100,
        y: 30
    };
    var arcColor = '#000';
    var color = '#8C8C8C';
    var lineWidth = 5;

    drawArrow(draw, arcColor, offset, sex, gender, sexChange, arcHeight, lineWidth, false);
    if (noOrientation === false) {
        drawArrow(draw, color, offset, sex, orientation, acceptSexChange, arcHeight, lineWidth, true);

    }
    drawArc(draw, arcColor, offset, sex, arcHeight, lineWidth);
}

if (typeof window === "undefined") {
    const params = require("./params.js");
    module.exports = {
        paint: paint,
        params: params
    };
}
