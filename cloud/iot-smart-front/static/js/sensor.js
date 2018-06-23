var groupSize = 3;
var ValueWrapper = function (value) {
    switch (typeof value) {
        case 'boolean':
            return value ? "ON" : "OFF";
        case 'number':
            return value + " Lux";
        case 'object':
            if ('temperature' in value) {
                return value.temperature + "°C "
                    + value.humidity + "%rh";

            }
            else if ('x' in value) {
                return [
                    m("span.is-size-6",{style:"word-break: break-word;"}, String.format("v({0},{1},{2}) ", value.x, value.y, value.z)),
                    m("span.is-size-6",{style:"word-break: break-word;"}, String.format("a({0},{1},{2})", value.ax, value.ay, value.az))
                ];
            }
            else {
                return value;
            }
        default:
            return value;
    }
}
var SensorBox = function (sensor) {
    return m(".box .notification",
        m(".level .is-mobile",
            m(".level-item .level-left",
                m("",
                    m.trust("<div class=\"heading\">Name</div>"),
                    m(".title .is-5",
                        sensor.name
                    )
                )
            ),
            m(".level-item .level-right .has-text-right",
                m("",
                    m.trust("<div class=\"heading\">ID</div>"),
                    m(".title .is-5",
                        sensor.id
                    )
                )
            )
        ),
        m(".level .is-mobile",
            m(".level-item .level-left",
                m("",
                    m.trust("<div class=\"heading\">Value</div>"),
                    m(".title .is-5",
                        ValueWrapper(sensor.value)
                    )
                )
            )/*,
            m(".level-item .level-right .has-text-right",
                m("",
                    m.trust("<div class=\"heading\">Last Sync</div>"),
                    m(".title .is-5",
                        sensor.id
                    )
                )
            )*/
        )
    );
};
var Sensor = {
    list: [],
    info: {},
    sync: new Date(0),//last sync time
    errno: 0,//
    // get info by id
    load:
        function (id) {
            Sensor.info.id = id;
            Sensor.info.type = "sensor";
            return m.request(
                {
                    method: "POST",
                    url: API,
                    data: {
                        op: "query",
                        id: id,
                        type: "sensor",
                    },
                    withCredentials: true,
                }
            ).then(function (data) {
                Sensor.errno = data.errno;
                if (data.errno == 0) {
                    Sensor.info.name = data.value.name;
                    Sensor.info.value = data.value.value;
                    Sensor.sync = Date.now();
                }
                else {
                    Sensor.info.value = data.msg;
                    Sensor.info.name = "Unknown";
                }
            })
        }

    ,
// for sensor, only name can be modified
    update: function () {
        return m.request(
            {
                method: "POST",
                url: API,
                data: {
                    op: "modify",
                    id: Sensor.info.id,
                    type: "sensor",
                    name: Sensor.info.name
                },
                withCredentials: true,
            }
        )
    },
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
            Sensor.errno = data.errno;
            if (data.errno == 0) {
                Sensor.list = data.value.value;
                Sensor.sync = Date.now();
            }
            else {
                Sensor.list = [data.msg];
            }
        })
    }
};
var SensorList = {
    oninit: Sensor.loadlist,
    view: function () {
        return ((Sensor.list).map(function (item, index) {
            return index % groupSize === 0 ? Sensor.list.slice(index, index + groupSize) : null;
        }).filter(function (item) {
            return item;
        })).map(function (group) {
            return m(".columns", group.map(
                function (sensor) {
                    return m(".column .is-one-third", SensorBox(sensor))
                }
            ))
        })
    }
};