var DeviceBox = function (item) {
    return m("tr",
        [
            m("td", item.name),
            m("td", item.id),
            m("td", item.type)
        ]
    );
};
var Device = {
    list: [],
    mask: [],
    sync: new Date(0),//last sync time
    errno: 0,//
    loadlist: function () {
        return m.request(
            {
                method: "POST",
                url: API,
                data: {
                    op: "query_all",
                    id: 0,
                    type: "sensor"
                },
                withCredentials: true,
            }
        ).then(function (data) {
            Device.errno = data.errno;
            if (data.errno == 0) {
                Device.list = data.value.value;
                Device.sync = Date.now();
            }
            else {
                Device.list = [data.msg];
            }
        }).then(function () {
            m.request(
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
                if (Device.errno == 0 && data.errno == 0) {
                    Device.list = Device.list.concat(data.value.value);
                    Device.sync = Date.now();
                }
                else {
                    if (Device.errno == 0) {
                        Device.list = [data.msg];
                    }
                    else {
                        Device.list[0] += data.msg;
                    }
                }
                Device.errno = data.errno;
            })
        })
    }
};
var DeviceList = {
    oninit: Device.loadlist,
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
                                "Type"
                            )
                        ]
                    )
                ),
                m("tbody",
                    Device.list.map(DeviceBox)
                )
            ]
        )
    }
};