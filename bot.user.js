// ==UserScript==
// @name         Slither.io BOT [AnonCheat]
// @namespace    http://slither.io/
// @version      1.3.2
// @description  Auto-Bot
// @author       AnonCheat
// @match        http://slither.io/
// @grant        none
// ==/UserScript==

const TARGET_FPS = 60;

window.log = function() {
    if (window.logDebugging) {
        console.log.apply(console, arguments);
    }
};

window.getSnakeLength = function() {
    return (Math.floor(
        150 *
        (window.fpsls[window.snake.sct] + window.snake.fam / window.fmlts[window.snake.sct] - 1) -
        50) / 10);
};
window.getSnakeWidth = function(sc) {
    if (sc === undefined) sc = window.snake.sc;
    return sc * 29.0;
};

var canvas = window.canvas = (function() {
    return {
        canvasRatio: {
            x: window.mc.width / window.ww,
            y: window.mc.height / window.hh
        },

        setMouseCoordinates: function(point) {
            window.xm = point.x;
            window.ym = point.y;
        },

        mouseToScreen: function(point) {
            var screenX = point.x + (window.ww / 2);
            var screenY = point.y + (window.hh / 2);
            return { x: screenX, y: screenY };
        },

        screenToCanvas: function(point) {
            var canvasX = window.csc *
                (point.x * canvas.canvasRatio.x) - parseInt(window.mc.style.left);
            var canvasY = window.csc *
                (point.y * canvas.canvasRatio.y) - parseInt(window.mc.style.top);
            return { x: canvasX, y: canvasY };
        },

        mapToMouse: function(point) {
            var mouseX = (point.x - window.snake.xx) * window.gsc;
            var mouseY = (point.y - window.snake.yy) * window.gsc;
            return { x: mouseX, y: mouseY };
        },

        mapToCanvas: function(point) {
            var c = canvas.mapToMouse(point);
            c = canvas.mouseToScreen(c);
            c = canvas.screenToCanvas(c);
            return c;
        },

        circleMapToCanvas: function(circle) {
            var newCircle = canvas.mapToCanvas(circle);
            return canvas.circle(
                newCircle.x,
                newCircle.y,
                circle.radius * window.gsc
            );
        },

        point: function(x, y) {
            var p = {
                x: Math.round(x),
                y: Math.round(y)
            };

            return p;
        },

        rect: function(x, y, w, h) {
            var r = {
                x: Math.round(x),
                y: Math.round(y),
                width: Math.round(w),
                height: Math.round(h)
            };

            return r;
        },

        circle: function(x, y, r) {
            var c = {
                x: Math.round(x),
                y: Math.round(y),
                radius: Math.round(r)
            };

            return c;
        },

        fastAtan2: function(y, x) {
            const QPI = Math.PI / 4;
            const TQPI = 3 * Math.PI / 4;
            var r = 0.0;
            var angle = 0.0;
            var abs_y = Math.abs(y) + 1e-10;
            if (x < 0) {
                r = (x + abs_y) / (abs_y - x);
                angle = TQPI;
            } else {
                r = (x - abs_y) / (x + abs_y);
                angle = QPI;
            }
            angle += (0.1963 * r * r - 0.9817) * r;
            if (y < 0) {
                return -angle;
            }

            return angle;
        },

        setZoom: function(e) {
            if (window.gsc) {
                window.gsc *= Math.pow(0.9, e.wheelDelta / -120 || e.detail / 2 || 0);
                window.desired_gsc = window.gsc;
            }
        },

        resetZoom: function() {
            window.gsc = 0.9;
            window.desired_gsc = 0.9;
        },

        maintainZoom: function() {
            if (window.desired_gsc !== undefined) {
                window.gsc = window.desired_gsc;
            }
        },

        setBackground: function(url) {
            url = typeof url !== 'undefined' ? url : '/s/bg45.jpg';
            window.ii.src = url;
        },

        drawRect: function(rect, color, fill, alpha) {
            if (alpha === undefined) alpha = 1;

            var context = window.mc.getContext('2d');
            var lc = canvas.mapToCanvas({x: rect.x, y: rect.y});

            context.save();
            context.globalAlpha = alpha;
            context.strokeStyle = color;
            context.rect(lc.x, lc.y, rect.width * window.gsc, rect.height * window.gsc);
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },

        drawCircle: function(circle, color, fill, alpha) {
            if (alpha === undefined) alpha = 1;
            if (circle.radius === undefined) circle.radius = 5;

            var context = window.mc.getContext('2d');
            var drawCircle = canvas.circleMapToCanvas(circle);

            context.save();
            context.globalAlpha = alpha;
            context.beginPath();
            context.strokeStyle = color;
            context.arc(drawCircle.x, drawCircle.y, drawCircle.radius, 0, Math.PI * 2);
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },

        drawAngle: function(start, angle, color, fill, alpha) {
            if (alpha === undefined) alpha = 0.6;

            var context = window.mc.getContext('2d');

            context.save();
            context.globalAlpha = alpha;
            context.beginPath();
            context.moveTo(window.mc.width / 2, window.mc.height / 2);
            context.arc(window.mc.width / 2, window.mc.height / 2, window.gsc * 100, start, angle);
            context.lineTo(window.mc.width / 2, window.mc.height / 2);
            context.closePath();
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },

        drawLine: function(p1, p2, color, width) {
            if (width === undefined) width = 5;

            var context = window.mc.getContext('2d');
            var dp1 = canvas.mapToCanvas(p1);
            var dp2 = canvas.mapToCanvas(p2);

            context.save();
            context.beginPath();
            context.lineWidth = width * window.gsc;
            context.strokeStyle = color;
            context.moveTo(dp1.x, dp1.y);
            context.lineTo(dp2.x, dp2.y);
            context.stroke();
            context.restore();
        },

        isLeft: function(start, end, point) {
            return ((end.x - start.x) * (point.y - start.y) -
             (end.y - start.y) * (point.x - start.x)) > 0;

        },

        getDistance2: function(x1, y1, x2, y2) {
            var distance2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
            return distance2;
        },

        getDistance2FromSnake: function(point) {
            point.distance = canvas.getDistance2(window.snake.xx, window.snake.yy,
                point.xx, point.yy);
            return point;
        },

        pointInRect: function(point, rect) {
            if (rect.x <= point.x && rect.y <= point.y &&
                rect.x + rect.width >= point.x && rect.y + rect.height >= point.y) {
                return true;
            }
            return false;
        },

        circleIntersect: function(circle1, circle2) {
            var bothRadii = circle1.radius + circle2.radius;

            if (circle1.x + bothRadii > circle2.x &&
                circle1.y + bothRadii > circle2.y &&
                circle1.x < circle2.x + bothRadii &&
                circle1.y < circle2.y + bothRadii) {

                var distance2 = canvas.getDistance2(circle1.x, circle1.y, circle2.x, circle2.y);

                if (distance2 < bothRadii * bothRadii) {
                    if (window.visualDebugging) {
                        var collisionPointCircle = canvas.circle(
                            ((circle1.x * circle2.radius) + (circle2.x * circle1.radius)) /
                                bothRadii,
                            ((circle1.y * circle2.radius) + (circle2.y * circle1.radius)) /
                                bothRadii,
                            5
                        );
                        canvas.drawCircle(circle2, 'red', true);
                        canvas.drawCircle(collisionPointCircle, 'cyan', true);
                    }
                    return true;
                }
            }
            return false;
        }
    };
})();

var bot = window.bot = (function() {
    return {
        isBotRunning: false,
        isBotEnabled: true,
        lookForFood: false,
        collisionPoints: [],
        collisionAngles: [],
        scores: [],
        foodTimeout: undefined,
        sectorBoxSide: 0,
        defaultAccel: 0,
        sectorBox: {},
        currentFood: {},
        MID_X: 0,
        MID_Y: 0,
        MAP_R: 0,

        quickRespawn: function() {
            window.dead_mtm = 0;
            window.login_fr = 0;

            bot.isBotRunning = false;
            window.forcing = true;
            window.connect();
            window.forcing = false;
        },

        angleBetween: function(a1, a2) {
            var r1 = 0.0;
            var r2 = 0.0;

            r1 = (a1 - a2) % Math.PI;
            r2 = (a2 - a1) % Math.PI;

            return r1 < r2 ? -r1 : r2;
        },

        avoidHeadPoint: function(collisionPoint) {
            var cehang = canvas.fastAtan2(
                collisionPoint.yy - window.snake.yy, collisionPoint.xx - window.snake.xx);
            var diff = bot.angleBetween(window.snake.ehang, cehang);


            if (Math.abs(diff) > 3 * Math.PI / 4) {
                var dir = diff > 0 ? -Math.PI / 2 : Math.PI / 2;
                bot.changeHeading(dir);
            } else {
                bot.avoidCollisionPoint(collisionPoint);
            }
        },

        changeHeading: function(angle) {
            var heading = {
                x: window.snake.xx + 500 * window.snake.cos,
                y: window.snake.yy + 500 * window.snake.sin
            };

            var cos = Math.cos(-angle);
            var sin = Math.sin(-angle);

            window.goalCoordinates = {
                x: Math.round(
                    cos * (heading.x - window.snake.xx) -
                    sin * (heading.y - window.snake.yy) + window.snake.xx),
                y: Math.round(
                    sin * (heading.x - window.snake.xx) +
                    cos * (heading.y - window.snake.yy) + window.snake.yy)
            };

            canvas.setMouseCoordinates(canvas.mapToMouse(window.goalCoordinates));
        },

        avoidCollisionPoint: function(collisionPoint, ang) {
            if (ang === undefined || ang > Math.PI) {
                ang = Math.PI;
            }

            var end = {
                x: window.snake.xx + 2000 * window.snake.cos,
                y: window.snake.yy + 2000 * window.snake.sin
            };

            if (window.visualDebugging) {
                canvas.drawLine(
                    {x: window.snake.xx, y: window.snake.yy},
                    end,
                    'orange', 5);
                canvas.drawLine(
                    {x: window.snake.xx, y: window.snake.yy},
                    {x: collisionPoint.xx, y: collisionPoint.yy},
                    'red', 5);
            }

            var cos = Math.cos(ang);
            var sin = Math.sin(ang);

            if (canvas.isLeft(
                { x: window.snake.xx, y: window.snake.yy }, end,
                { x: collisionPoint.xx, y: collisionPoint.yy })) {
                sin = -sin;
            }

            window.goalCoordinates = {
                x: Math.round(
                    cos * (collisionPoint.xx - window.snake.xx) -
                    sin * (collisionPoint.yy - window.snake.yy) + window.snake.xx),
                y: Math.round(
                    sin * (collisionPoint.xx - window.snake.xx) +
                    cos * (collisionPoint.yy - window.snake.yy) + window.snake.yy)
            };

            canvas.setMouseCoordinates(canvas.mapToMouse(window.goalCoordinates));
        },

        sortDistance: function(a, b) {
            return a.distance - b.distance;
        },

        getAngleIndex: function(angle) {
            const ARCSIZE = Math.PI / 4;
            var index;

            if (angle < 0) {
                angle += 2 * Math.PI;
            }

            index = Math.round(angle * (1 / ARCSIZE));

            if (index === (2 * Math.PI) / ARCSIZE) {
                return 0;
            }
            return index;
        },

        addCollisionAngle: function(sp) {
            var ang = canvas.fastAtan2(
                Math.round(sp.yy - window.snake.yy),
                Math.round(sp.xx - window.snake.xx));
            var aIndex = bot.getAngleIndex(ang);

            var actualDistance = Math.round(
                sp.distance - (Math.pow(window.getSnakeWidth(window.snakes[sp.snake].sc), 2) / 2));

            if (bot.collisionAngles[aIndex] === undefined) {
                bot.collisionAngles[aIndex] = {
                    x: Math.round(sp.xx),
                    y: Math.round(sp.yy),
                    ang: ang,
                    snake: sp.snake,
                    distance: actualDistance
                };
            } else if (bot.collisionAngles[aIndex].distance > sp.distance) {
                bot.collisionAngles[aIndex].x = Math.round(sp.xx);
                bot.collisionAngles[aIndex].y = Math.round(sp.yy);
                bot.collisionAngles[aIndex].ang = ang;
                bot.collisionAngles[aIndex].snake = sp.snake;
                bot.collisionAngles[aIndex].distance = actualDistance;
            }
        },

        getCollisionPoints: function() {
            var scPoint;

            bot.collisionPoints = [];
            bot.collisionAngles = [];


            for (var snake = 0, ls = window.snakes.length; snake < ls; snake++) {
                scPoint = undefined;

                if (window.snakes[snake].id !== window.snake.id &&
                    window.snakes[snake].alive_amt === 1) {
                    if (window.visualDebugging) {
                        canvas.drawCircle(canvas.circle(
                            window.snakes[snake].xx,
                            window.snakes[snake].yy,
                            window.getSnakeWidth(window.snakes[snake].sc) / 2),
                            'red', false);
                    }
                    scPoint = {
                        xx: window.snakes[snake].xx,
                        yy: window.snakes[snake].yy,
                        snake: snake
                    };
                    canvas.getDistance2FromSnake(scPoint);
                    bot.addCollisionAngle(scPoint);

                    for (var pts = 0, lp = window.snakes[snake].pts.length; pts < lp; pts++) {
                        if (!window.snakes[snake].pts[pts].dying &&
                            canvas.pointInRect(
                                {x: window.snakes[snake].pts[pts].xx,
                                    y: window.snakes[snake].pts[pts].yy}, bot.sectorBox)
                            ) {
                            var collisionPoint = {
                                xx: window.snakes[snake].pts[pts].xx,
                                yy: window.snakes[snake].pts[pts].yy,
                                snake: snake
                            };

                            if (window.visualDebugging && true === false) {
                                canvas.drawCircle(canvas.circle(
                                    collisionPoint.xx,
                                    collisionPoint.yy,
                                    window.getSnakeWidth(window.snakes[snake].sc) / 2),
                                    '#00FF00', false);
                            }

                            canvas.getDistance2FromSnake(collisionPoint);
                            bot.addCollisionAngle(collisionPoint);

                            if (scPoint === undefined ||
                                scPoint.distance > collisionPoint.distance) {
                                scPoint = collisionPoint;
                            }
                        }
                    }
                }
                if (scPoint !== undefined) {
                    bot.collisionPoints.push(scPoint);
                    if (window.visualDebugging) {
                        canvas.drawCircle(canvas.circle(
                            scPoint.xx,
                            scPoint.yy,
                            window.getSnakeWidth(window.snakes[scPoint.snake].sc) / 2
                        ), 'red', false);
                    }
                }
            }

            if (canvas.getDistance2(bot.MID_X, bot.MID_Y, window.snake.xx, window.snake.yy) >
                Math.pow(bot.MAP_R - 1000, 2)) {
                var midAng = canvas.fastAtan2(
                    window.snake.yy - bot.MID_X, window.snake.xx - bot.MID_Y);
                scPoint = {
                    xx: bot.MID_X + bot.MAP_R * Math.cos(midAng),
                    yy: bot.MID_Y + bot.MAP_R * Math.sin(midAng),
                    snake: -1
                };
                bot.collisionPoints.push(scPoint);
                if (window.visualDebugging) {
                    canvas.drawCircle(canvas.circle(
                        scPoint.xx,
                        scPoint.yy,
                        window.getSnakeWidth(1) * 5
                    ), 'yellow', false);
                }
            }


            bot.collisionPoints.sort(bot.sortDistance);
            if (window.visualDebugging) {
                for (var i = 0; i < bot.collisionAngles.length; i++) {
                    if (bot.collisionAngles[i] !== undefined) {
                        canvas.drawLine(
                        {x: window.snake.xx, y: window.snake.yy},
                        {x: bot.collisionAngles[i].x, y: bot.collisionAngles[i].y},
                        '#99ffcc', 2);
                    }
                }
            }
        },

        checkCollision: function(r) {
            if (!window.collisionDetection) return false;

            r = Number(r);
            var xx = Number(window.snake.xx.toFixed(3));
            var yy = Number(window.snake.yy.toFixed(3));

            window.snake.cos = Math.cos(window.snake.ang).toFixed(3);
            window.snake.sin = Math.sin(window.snake.ang).toFixed(3);

            const speedMult = window.snake.sp / 5.78;
            const widthMult = window.getSnakeWidth();

            var headCircle = canvas.circle(
                xx, yy,
                speedMult * r / 2 * widthMult / 2
            );

            var fullHeadCircle = canvas.circle(
                xx, yy,
                r * widthMult / 2
            );

            var sidecircle_r = canvas.circle(
                window.snake.lnp.xx -
                    ((window.snake.lnp.yy + window.snake.sin * window.getSnakeWidth()) -
                    window.snake.lnp.yy),
                window.snake.lnp.yy +
                    ((window.snake.lnp.xx + window.snake.cos * window.getSnakeWidth()) -
                    window.snake.lnp.xx),
                window.getSnakeWidth() * speedMult
            );

            var sidecircle_l = canvas.circle(
                window.snake.lnp.xx +
                    ((window.snake.lnp.yy + window.snake.sin * window.getSnakeWidth()) -
                    window.snake.lnp.yy),
                 window.snake.lnp.yy -
                    ((window.snake.lnp.xx + window.snake.cos * window.getSnakeWidth()) -
                    window.snake.lnp.xx),
                window.getSnakeWidth() * speedMult
            );

            window.snake.sidecircle_r = sidecircle_r;
            window.snake.sidecircle_l = sidecircle_l;

            if (window.visualDebugging) {
                canvas.drawCircle(fullHeadCircle, 'red');
                canvas.drawCircle(headCircle, 'blue', false);
            }

            bot.getCollisionPoints();
            if (bot.collisionPoints.length === 0) return false;

            for (var i = 0; i < bot.collisionPoints.length; i++) {
                var colR = bot.collisionPoints[i].snake === -1 ? window.getSnakeWidth(1) * 5 :
                    window.getSnakeWidth(window.snakes[bot.collisionPoints[i].snake].sc) / 2;

                var collisionCircle = canvas.circle(
                    bot.collisionPoints[i].xx,
                    bot.collisionPoints[i].yy,
                    colR
                );

                if (canvas.circleIntersect(headCircle, collisionCircle)) {
                    window.setAcceleration(bot.defaultAccel);
                    bot.avoidCollisionPoint(bot.collisionPoints[i]);
                    return true;
                }

                if (bot.collisionPoints[i].snake !== -1) {
                    var eHeadCircle = canvas.circle(
                        window.snakes[bot.collisionPoints[i].snake].xx,
                        window.snakes[bot.collisionPoints[i].snake].yy,
                        colR
                    );


                    if (canvas.circleIntersect(fullHeadCircle, eHeadCircle)) {
                        if (window.snakes[bot.collisionPoints[i].snake].sp > 10) {
                            window.setAcceleration(1);
                        } else {
                            window.setAcceleration(bot.defaultAccel);
                        }
                        bot.avoidHeadPoint({
                            xx: window.snakes[bot.collisionPoints[i].snake].xx,
                            yy: window.snakes[bot.collisionPoints[i].snake].yy
                        });
                        return true;
                    }
                }
            }
            window.setAcceleration(bot.defaultAccel);
            return false;
        },

        sortScore: function(a, b) {
            return b.score - a.score;
        },

        scoreFood: function(f) {
            f.score = Math.pow(Math.ceil(f.sz / 5) * 5, 2) /
                f.distance / (Math.ceil(f.da * 2.546) / 2.546);
        },

        computeFoodGoal: function() {
            var foodClusters = [];
            var foodGetIndex = [];
            var fi = 0;
            var sw = window.getSnakeWidth();

            for (var i = 0; i < window.foods.length && window.foods[i] !== null; i++) {
                var a;
                var da;
                var distance;
                var sang = window.snake.ehang;
                var f = window.foods[i];

                if (!f.eaten &&
                    !(
                    canvas.circleIntersect(
                        canvas.circle(f.xx, f.yy, 2),
                        window.snake.sidecircle_l) ||
                    canvas.circleIntersect(
                        canvas.circle(f.xx, f.yy, 2),
                        window.snake.sidecircle_r))) {

                    var cx = Math.round(Math.round(f.xx / sw) * sw);
                    var cy = Math.round(Math.round(f.yy / sw) * sw);
                    var csz = Math.round(f.sz);

                    if (foodGetIndex[cx + '|' + cy] === undefined) {
                        foodGetIndex[cx + '|' + cy] = fi;
                        a = canvas.fastAtan2(cy - window.snake.yy, cx - window.snake.xx);
                        da = Math.min(
                            (2 * Math.PI) - Math.abs(a - sang), Math.abs(a - sang));
                        distance = Math.round(
                            canvas.getDistance2(cx, cy, window.snake.xx, window.snake.yy));
                        foodClusters[fi] = {
                            x: cx, y: cy, a: a, da: da, sz: csz, distance: distance, score: 0.0 };
                        fi++;
                    } else {
                        foodClusters[foodGetIndex[cx + '|' + cy]].sz += csz;
                    }
                }
            }

            foodClusters.forEach(bot.scoreFood);
            foodClusters.sort(bot.sortScore);

            for (i = 0; i < foodClusters.length; i++) {
                var aIndex = bot.getAngleIndex(foodClusters[i].a);
                if (bot.collisionAngles[aIndex] === undefined ||
                    (bot.collisionAngles[aIndex].distance - Math.pow(window.getSnakeWidth(), 2) >
                    foodClusters[i].distance && foodClusters[i].sz > 10)
                    ) {
                    bot.currentFood = foodClusters[i];
                    return;
                }
            }
            bot.currentFood = {x: bot.MID_X, y: bot.MID_Y};
        },

        foodAccel: function() {
            var aIndex = 0;

            if (bot.currentFood && bot.currentFood.sz > 60) {
                aIndex = bot.getAngleIndex(bot.currentFood.a);

                if (
                    bot.collisionAngles[aIndex] && bot.collisionAngles[aIndex].distance >
                    bot.currentFood.distance * 2) {
                    return 1;
                }

                if (bot.collisionAngles[aIndex] === undefined) {
                    return 1;
                }
            }

            return bot.defaultAccel;
        },

        collisionLoop: function() {
            bot.MID_X = window.grd;
            bot.MID_Y = window.grd;
            bot.MAP_R = window.grd * 0.98;

            bot.sectorBoxSide = Math.floor(Math.sqrt(window.sectors.length)) * window.sector_size;
            bot.sectorBox = canvas.rect(
                window.snake.xx - (bot.sectorBoxSide / 2),
                window.snake.yy - (bot.sectorBoxSide / 2),
                bot.sectorBoxSide, bot.sectorBoxSide);

            if (bot.checkCollision(window.collisionRadiusMultiplier)) {
                bot.lookForFood = false;
                if (bot.foodTimeout) {
                    window.clearTimeout(bot.foodTimeout);
                    bot.foodTimeout = window.setTimeout(bot.foodTimer, 1000 / TARGET_FPS * 4);
                }
            } else {
                bot.lookForFood = true;
                if (bot.foodTimeout === undefined) {
                    bot.foodTimeout = window.setTimeout(bot.foodTimer, 1000 / TARGET_FPS * 4);
                }
                window.setAcceleration(bot.foodAccel());
            }
        },

        foodTimer: function() {
            if (window.playing && bot.lookForFood &&
                window.snake !== null && window.snake.alive_amt === 1) {
                bot.computeFoodGoal();
                window.goalCoordinates = bot.currentFood;
                canvas.setMouseCoordinates(canvas.mapToMouse(window.goalCoordinates));
            }
            bot.foodTimeout = undefined;
        }
    };
})();

var userInterface = window.userInterface = (function() {
    var original_keydown = document.onkeydown;
    var original_onmouseDown = window.onmousedown;
    var original_oef = window.oef;
    var original_redraw = window.redraw;
    var original_onmousemove = window.onmousemove;

    window.oef = function() {};
    window.redraw = function() {};

    return {
        overlays: {},

        initOverlays: function() {
            var botOverlay = document.createElement('div');
            botOverlay.style.position = 'fixed';
            botOverlay.style.right = '5px';
            botOverlay.style.bottom = '112px';
            botOverlay.style.width = '150px';
            botOverlay.style.height = '85px';
            botOverlay.style.color = '#C0C0C0';
            botOverlay.style.fontFamily = 'Consolas, Verdana';
            botOverlay.style.zIndex = 999;
            botOverlay.style.fontSize = '14px';
            botOverlay.style.padding = '5px';
            botOverlay.style.borderRadius = '5px';
            botOverlay.className = 'nsi';
            document.body.appendChild(botOverlay);

            var serverOverlay = document.createElement('div');
            serverOverlay.style.position = 'fixed';
            serverOverlay.style.right = '5px';
            serverOverlay.style.bottom = '5px';
            serverOverlay.style.width = '160px';
            serverOverlay.style.height = '14px';
            serverOverlay.style.color = '#C0C0C0';
            serverOverlay.style.fontFamily = 'Consolas, Verdana';
            serverOverlay.style.zIndex = 999;
            serverOverlay.style.fontSize = '14px';
            serverOverlay.className = 'nsi';
            document.body.appendChild(serverOverlay);

            var prefOverlay = document.createElement('div');
            prefOverlay.style.position = 'fixed';
            prefOverlay.style.left = '10px';
            prefOverlay.style.top = '75px';
            prefOverlay.style.width = '260px';
            prefOverlay.style.height = '210px';
            prefOverlay.style.color = '#C0C0C0';
            prefOverlay.style.fontFamily = 'Consolas, Verdana';
            prefOverlay.style.zIndex = 999;
            prefOverlay.style.fontSize = '14px';
            prefOverlay.style.padding = '5px';
            prefOverlay.style.borderRadius = '5px';
            prefOverlay.className = 'nsi';
            document.body.appendChild(prefOverlay);

            var statsOverlay = document.createElement('div');
            statsOverlay.style.position = 'fixed';
            statsOverlay.style.left = '10px';
            statsOverlay.style.top = '295px';
            statsOverlay.style.width = '140px';
            statsOverlay.style.height = '210px';
            statsOverlay.style.color = '#C0C0C0';
            statsOverlay.style.fontFamily = 'Consolas, Verdana';
            statsOverlay.style.zIndex = 998;
            statsOverlay.style.fontSize = '14px';
            statsOverlay.style.padding = '5px';
            statsOverlay.style.borderRadius = '5px';
            statsOverlay.className = 'nsi';
            document.body.appendChild(statsOverlay);

            userInterface.overlays.botOverlay = botOverlay;
            userInterface.overlays.serverOverlay = serverOverlay;
            userInterface.overlays.prefOverlay = prefOverlay;
            userInterface.overlays.statsOverlay = statsOverlay;
        },

        toggleOverlays: function() {
            Object.keys(userInterface.overlays).forEach(function(okey) {
                var oVis = userInterface.overlays[okey].style.visibility !== 'hidden' ?
                    'hidden' : 'visible';
                userInterface.overlays[okey].style.visibility = oVis;
                window.visualDebugging = oVis === 'visible';
            });
        },

        savePreference: function(item, value) {
            window.localStorage.setItem(item, value);
            userInterface.onPrefChange();
        },

        loadPreference: function(preference, defaultVar) {
            var savedItem = window.localStorage.getItem(preference);
            if (savedItem !== null) {
                if (savedItem === 'true') {
                    window[preference] = true;
                } else if (savedItem === 'false') {
                    window[preference] = false;
                } else {
                    window[preference] = savedItem;
                }
                window.log('Setting found for ' + preference + ': ' + window[preference]);
            } else {
                window[preference] = defaultVar;
                window.log('No setting found for ' + preference +
                    '. Used default: ' + window[preference]);
            }
            userInterface.onPrefChange();
            return window[preference];
        },

        playButtonClickListener: function() {
            userInterface.saveNick();
            userInterface.loadPreference('autoRespawn', false);
            userInterface.onPrefChange();
        },

        saveNick: function() {
            var nick = document.getElementById('nick').value;
            userInterface.savePreference('savedNick', nick);
        },

        hideTop: function() {
            var nsidivs = document.querySelectorAll('div.nsi');
            for (var i = 0; i < nsidivs.length; i++) {
                if (nsidivs[i].style.top === '4px' && nsidivs[i].style.width === '300px') {
                    nsidivs[i].style.visibility = 'hidden';
                    bot.isTopHidden = true;
                    window.topscore = nsidivs[i];
                }
            }
        },

        framesPerSecond: {
            fps: 0,
            fpsTimer: function() {
                if (window.playing && window.fps && window.lrd_mtm) {
                    if (Date.now() - window.lrd_mtm > 970) {
                        userInterface.framesPerSecond.fps = window.fps;
                    }
                }
            }
        },

        onkeydown: function(e) {
            original_keydown(e);
            if (window.playing) {
                if (e.keyCode === 84) {
                    bot.isBotEnabled = !bot.isBotEnabled;
                }
                if (e.keyCode === 85) {
                    window.logDebugging = !window.logDebugging;
                    console.log('Log debugging set to: ' + window.logDebugging);
                    userInterface.savePreference('logDebugging', window.logDebugging);
                }
                if (e.keyCode === 89) {
                    window.visualDebugging = !window.visualDebugging;
                    console.log('Visual debugging set to: ' + window.visualDebugging);
                    userInterface.savePreference('visualDebugging', window.visualDebugging);
                }
                if (e.keyCode === 73) {
                    window.autoRespawn = !window.autoRespawn;
                    console.log('Automatic Respawning set to: ' + window.autoRespawn);
                    userInterface.savePreference('autoRespawn', window.autoRespawn);
                }
                if (e.keyCode === 72) {
                    userInterface.toggleOverlays();
                }
                if (e.keyCode === 79) {
                    userInterface.toggleMobileRendering(!window.mobileRender);
                }
                if (e.keyCode === 67) {
                    window.collisionDetection = !window.collisionDetection;
                    console.log('collisionDetection set to: ' + window.collisionDetection);
                    userInterface.savePreference('collisionDetection', window.collisionDetection);
                }
                if (e.keyCode === 65) {
                    window.collisionRadiusMultiplier++;
                    console.log(
                        'collisionRadiusMultiplier set to: ' + window.collisionRadiusMultiplier);
                    userInterface.savePreference(
                        'collisionRadiusMultiplier', window.collisionRadiusMultiplier);
                }
                if (e.keyCode === 83) {
                    if (window.collisionRadiusMultiplier > 1) {
                        window.collisionRadiusMultiplier--;
                        console.log(
                            'collisionRadiusMultiplier set to: ' +
                            window.collisionRadiusMultiplier);
                        userInterface.savePreference(
                            'collisionRadiusMultiplier', window.collisionRadiusMultiplier);
                    }
                }
                if (e.keyCode === 90) {
                    canvas.resetZoom();
                }
                if (e.keyCode === 81) {
                    window.autoRespawn = false;
                    userInterface.quit();
                }
                if (e.keyCode === 27) {
                    bot.quickRespawn();
                }
                if (e.keyCode === 13) {
                    userInterface.saveNick();
                }
                userInterface.onPrefChange();
            }
        },

        onmousedown: function(e) {
            if (window.playing) {
                switch (e.which) {
                    case 1:
                        bot.defaultAccel = 1;
                        if (!bot.isBotEnabled) {
                            original_onmouseDown(e);
                        }
                        break;
                    case 3:
                        bot.isBotEnabled = !bot.isBotEnabled;
                        break;
                }
            } else {
                original_onmouseDown(e);
            }
            userInterface.onPrefChange();
        },

        onmouseup: function() {
            bot.defaultAccel = 0;
        },

        toggleMobileRendering: function(mobileRendering) {
            window.mobileRender = mobileRendering;
            window.log('Mobile rendering set to: ' + window.mobileRender);
            userInterface.savePreference('mobileRender', window.mobileRender);
            if (window.mobileRender) {
                canvas.setBackground(
                    'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs');
                window.render_mode = 1;
                window.want_quality = 0;
                window.high_quality = false;
            } else {
                canvas.setBackground();
                window.render_mode = 2;
                window.want_quality = 1;
                window.high_quality = true;
            }
        },

        updateStats: function() {
            var oContent = [];

            if (bot.scores.length === 0) return;

            oContent.push('Games Played: ' + bot.scores.length);
            oContent.push('Average Score: ' + Math.round(
                bot.scores.reduce(function(a, b) { return a + b; }) / (bot.scores.length)));

            for (var i = 0; i < bot.scores.length && i < 10; i++) {
                oContent.push(i + 1 + '. ' + bot.scores[i]);
            }

            userInterface.overlays.statsOverlay.innerHTML = oContent.join('<br/>');
        },

        onPrefChange: function() {
            var oContent = [];
            var ht = userInterface.handleTextColor;

            oContent.push('[AnonCheat] Menu v ' + GM_info.script.version);
            oContent.push('[T] Auto-Bot: ' + ht(bot.isBotEnabled));
            oContent.push('[C] Collision Detection: ' + ht(window.collisionDetection));
            oContent.push('[O] Mobile Rendering: ' + ht(window.mobileRender));
            oContent.push('[A/S] Radius Multiplier: ' + window.collisionRadiusMultiplier);
            oContent.push('[I] Auto Respawn: ' + ht(window.autoRespawn));
            oContent.push('[Y] Yisual Debugging: ' + ht(window.visualDebugging));
            oContent.push('[U] Log Debugging: ' + ht(window.logDebugging));
            oContent.push('[Wheel] Zoom');
            oContent.push('[Z] Reset Zoom');
            oContent.push('[ESC] Quick Respawn');
            oContent.push('[Q] Quit to Menu');

            userInterface.overlays.prefOverlay.innerHTML = oContent.join('<br/>');
        },

        onFrameUpdate: function() {
            var oContent = [];

            if (window.playing && window.snake !== null) {
                oContent.push('FPS: ' + userInterface.framesPerSecond.fps);

                oContent.push('X: ' +
                    (Math.round(window.snake.xx) || 0) + ' Y: ' +
                    (Math.round(window.snake.yy) || 0));

                if (window.goalCoordinates) {
                    oContent.push('↓ Target');
                    oContent.push('X: ' + window.goalCoordinates.x + ' Y: ' +
                        window.goalCoordinates.y);
                    if (window.goalCoordinates.sz) {
                        oContent.push('SZ: ' + window.goalCoordinates.sz);
                    }
                }

                if (window.bso !== undefined && userInterface.overlays.serverOverlay.innerHTML !==
                    window.bso.ip + ':' + window.bso.po) {
                    userInterface.overlays.serverOverlay.innerHTML =
                        window.bso.ip + ':' + window.bso.po;
                }
            }

            userInterface.overlays.botOverlay.innerHTML = oContent.join('<br/>');


            if (window.playing && window.visualDebugging) {
                if (window.goalCoordinates && bot.isBotEnabled) {
                    var headCoord = {x: window.snake.xx, y: window.snake.yy};
                    canvas.drawLine(
                        headCoord,
                        window.goalCoordinates,
                        'green');
                    canvas.drawCircle(window.goalCoordinates, 'red', true);
                }
            }
        },

        oefTimer: function() {
            var start = Date.now();
            canvas.maintainZoom();
            original_oef();
            original_redraw();

            if (window.playing && bot.isBotEnabled && window.snake !== null) {
                window.onmousemove = function() { };
                bot.isBotRunning = true;
                bot.collisionLoop();
            } else if (bot.isBotEnabled && bot.isBotRunning) {
                bot.isBotRunning = false;
                if (window.lastscore && window.lastscore.childNodes[1]) {
                    bot.scores.push(parseInt(window.lastscore.childNodes[1].innerHTML));
                    bot.scores.sort(function(a, b) { return b - a; });
                    userInterface.updateStats();
                }

                if (window.autoRespawn) {
                    window.connect();
                }
            }

            if (!bot.isBotEnabled || !bot.isBotRunning) {
                window.onmousemove = original_onmousemove;
            }

            userInterface.onFrameUpdate();
            setTimeout(userInterface.oefTimer, (1000 / TARGET_FPS) - (Date.now() - start));
        },

        quit: function() {
            if (window.playing && window.resetGame) {
                window.want_close_socket = true;
                window.dead_mtm = 0;
                if (window.play_btn) {
                    window.play_btn.setEnabled(true);
                }
                window.resetGame();
            }
        },

        onresize: function() {
            window.resize();
            canvas.canvasRatio = {
                x: window.mc.width / window.ww,
                y: window.mc.height / window.hh
            };
        },

        handleTextColor: function(enabled) {
            return '<span style=\"color:' +
                (enabled ? 'green;\">enabled' : 'red;\">disabled') + '</span>';
        }
    };
})();

		function setMenu() {
        var login = document.getElementById("login");
        if (login) {
            var div = document.createElement("div");
            div.style.width = "700px";
            div.style.color = "#85f9ae";
            div.style.fontFamily = "'Arial'";
            div.style.fontSize = "13px";
            div.style.textAlign = "center";
            div.style.opacity = "2";
            div.style.margin = "0 auto";
            div.style.padding = "5px 0";
            div.style.lineHeight = "18px";
		    login.appendChild(div);
            var stmenu = document.createElement("div");
            stmenu.style.width = "400px";
            stmenu.style.color = "#8058D0";            
            stmenu.style.borderRadius = "4px";
            stmenu.style.fontFamily = "'Arial'";
            stmenu.style.fontSize = "14px";
            stmenu.style.textAlign = "center";
            stmenu.style.margin = "0 auto 100px auto";
            stmenu.style.padding = "0 14px";
            stmenu.innerHTML = "[AnonCheat] Auto-Bot <a style='color:#8058D0;' target='_blank' href='https://github.com/AnonCheats'>GitHub</a>";
            login.appendChild(stmenu);
            stmenu.appendChild(div);
			stmenu.innerHTML += '<a href="https://github.com/AnonCheats" target="_blank" style="color:#00cbea;opacity:2;text-decoration:none;">Download Updates</a> | <a href="https://github.com/AnonCheats" target="_blank" style="color:#85f9ae;opacity:2;text-decoration:none;">Other Cheats</a>';
    }
	}
	setMenu();

(function() {
    window.play_btn.btnf.addEventListener('click', userInterface.playButtonClickListener);
    document.onkeydown = userInterface.onkeydown;
    window.onmousedown = userInterface.onmousedown;
    window.addEventListener('mouseup', userInterface.onmouseup);
    window.onresize = userInterface.onresize;

    userInterface.hideTop();

    userInterface.initOverlays();

    userInterface.loadPreference('logDebugging', false);
    userInterface.loadPreference('visualDebugging', false);
    userInterface.loadPreference('autoRespawn', false);
    userInterface.loadPreference('mobileRender', false);
    userInterface.loadPreference('collisionDetection', true);
    userInterface.loadPreference('collisionRadiusMultiplier', 10);
    window.nick.value = userInterface.loadPreference('savedNick', 'AnonCheat');

    document.body.addEventListener('mousewheel', canvas.setZoom);
    document.body.addEventListener('DOMMouseScroll', canvas.setZoom);

    if (window.mobileRender) {
        userInterface.toggleMobileRendering(true);
    } else {
        userInterface.toggleMobileRendering(false);
    }

    window.localStorage.setItem('edttsg', '1');

    window.social.remove();

    setInterval(userInterface.framesPerSecond.fpsTimer, 80);

    userInterface.oefTimer();
})();
