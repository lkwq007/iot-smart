var layout = {
    view: function (vnode) {
        return [
            m(header),
            m(vnode.attrs.part),
            //m(footer)
        ];
    }
};
var root = document.body;
m.route(root, "/", {
    "/": {
        view: function () {
            return m(layout, {part: ""})
        }
    },
    "/dashboard/:key":
        {
            view: function (vnode) {
                return m(layout, {part: content})
            }
        }
    ,
    "/about": {
        view: function () {
            return m(layout, {part: about})
        }
    },
});
setInterval(Sensor.loadlist,10000);
setInterval(Controller.loadlist,15000);