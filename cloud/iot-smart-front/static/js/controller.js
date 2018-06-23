var switch_func = function (id) {
    var result = Controller.list.filter(item => item.id == id)[0];
    Controller.switch(result);
}

var switch_button = function (item) {
    return m("a", {
            onclick: function () {
                switch_func(item.id)
            }
        },
        item.value ? [m(".control",
            m(".tags.has-addons",
                [
                    m("span.tag.is-dark",

                        "ON"
                    ),
                    m("span.tag.is-light",
                        "OFF"
                    )
                ]
            )
        )] : [m(".control",
            m(".tags.has-addons",
                [
                    m("span.tag.is-light",
                        "ON"
                    ),
                    m("span.tag.is-dark",

                        "OFF"
                    )
                ]
            )
        )]);
};
var ControllerBox = function (item) {
    return m("tr",
        [
            m("td", item.name),
            m("td", item.id),
            m("td", switch_button(item))
        ]
    );
};
var Controller = {
    list: [],
    info: {},
    sync: new Date(0),//last sync time
    errno: 0,//
    // get info by id
    load:
        function (id) {
            Controller.info.id = id;
            Controller.info.type = "controller";
            return m.request(
                {
                    method: "POST",
                    url: API,
                    data: {
                        op: "query",
                        id: id,
                        type: "controller",
                    },
                    withCredentials: true,
                }
            ).then(function (data) {
                Controller.errno = data.errno;
                if (data.errno == 0) {
                    Controller.info.name = data.value.name;
                    Controller.info.value = data.value.value;
                    Controller.sync = Date.now();
                }
                else {

                    Controller.info.value = data.msg;
                    Controller.info.name = "Unknown";
                }
            })
        }

    ,
// for controller, only name can be modified
    switch: function (item) {
        return m.request(
            {
                method: "POST",
                url: API,
                data: {
                    op: "modify",
                    id: item.id,
                    type: "controller",
                    name: item.name,
                    value: !item.value
                },
                withCredentials: true,
            }
        ).then(function (data) {
            if (data.errno == 0) {
                item.value = !item.value;
            }
        })
    },
    loadlist: function () {
        return m.request(
            {
                method: "POST",
                url: API,
                data: {
                    op: "query_all",
                    id: 0,
                    type: "controller"
                },
                withCredentials: true,
            }
        ).then(function (data) {
            Controller.errno = data.errno;
            if (data.errno == 0) {
                Controller.list = data.value.value;
                Controller.sync = Date.now();
            }
            else {
                Controller.list = [data.msg];
            }
        })
    }
};
var ControllerList = {
    oninit: Controller.loadlist,
    view: function () {
        return m("table.table.is-fullwidth.is-hoverable.is-striped",
            [
                m("thead",
                    m("tr",
                        [
                            m("th",
                                "Name"
                            ),
                            m("th",
                                "ID"
                            ),
                            m("th",
                                "Value"
                            )
                        ]
                    )
                ),
                m("tbody",
                    Controller.list.map(ControllerBox)
                )
            ]
        )
    }
};