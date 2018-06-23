// the viewer wrapper
// var API = "/generic-iot/api.php";
var API = "http://10.13.184.127:8080/generic-iot/api.php";
var Viewer = function (component) {
    return {
        view: function () {
            return component;
        }
    }
};

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};