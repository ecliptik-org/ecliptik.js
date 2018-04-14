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
    module.exports = {
        paint: paint,
        Params: Params
    };
}
