var myChart = null;
window.onresize = function () {
    if (myChart != null && myChart != undefined) {
        myChart.resize();
    }
}
var poolColors = function (a) {
    var pool = [];
    for (i = 0; i < a; i++) {
        pool.push(dynamicColors());
    }
    return pool;
}

var dynamicColors = function () {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

var redraw = function () {
    console.log(Stat.current);
}

var draw = function (vnode) {
    var dom = document.getElementById('chart');
    myChart = echarts.init(dom, 'shine');
    option = {
        title: {
            text: Stat.data[Stat.current].name,
            left: 'center',

        },
        gird: {
            bottom: 200
        },
        legend: {
            top: '8%',
            data: Stat.data[Stat.current].data.map(function (item) {
                return item.label;
            })
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: true
            }
        },
        yAxis: {
            max: 'dataMax',
            min: 'dataMin',
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: true
            }
        }, dataZoom: {},
        series: Stat.data[Stat.current].data.map(function (item) {
            var ret = {
                name: item.label,
                type: 'line',
                areaStyle: {},
                data: item.data
            }
            if (item.label == 'Bool') {
                ret.step = 'end';
            }
            else {
                ret.smooth = true;
            }
            return ret;
        })
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}

/*var draw_chartjs = function (vnode) {
    var ctx = document.getElementById('chart').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: Stat.data[Stat.current].data
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        minUnit: 'minute',
                    },
                    distribution: 'linears'
                    /!*                    time: {
                                            unit: 'second'
                                        }*!/
                }]
            }
        }
    });
};*/

var divide_chartjs = function (item, value) {
    var ret = [];
    switch (typeof value) {
        case 'boolean':
            ret = [{
                label: 'Bool',
                data: item.map(
                    function (_item) {
                        return {x: new Date(_item.time * 1000), y: _item.value ? 1 : 0};
                    }
                )
            }];
            break;
        case 'number':
            ret = [{
                label: 'Numeric',
                data: item.map(
                    function (_item) {
                        return {x: new Date(_item.time * 1000), y: _item.value};
                    }
                )
            }];
            break;
        case 'object':
            for (property in value) {
                ret = ret.concat([{
                    label: property,
                    data: item.map(function (_item) {
                        return {
                            x: new Date(_item.time * 1000),
                            y: _item.value[property]
                        }
                    })
                }])
            }
            break;
        default:
    }
    for (var i = 0; i < ret.length; i++) {
        ret[i].data.sort(function (a, b) {
            return new Date(a.x) - new Date(b.x);
        })
    }
    return ret;
};
var divide = function (item, value) {
    var ret = [];
    switch (typeof value) {
        case 'boolean':
            ret = [{
                label: 'Bool',
                data: item.map(
                    function (_item) {
                        return [new Date(_item.time * 1000), _item.value ? 1 : 0];
                    }
                )
            }];
            break;
        case 'number':
            ret = [{
                label: 'Numeric',
                data: item.map(
                    function (_item) {
                        return [new Date(_item.time * 1000), _item.value];
                    }
                )
            }];
            break;
        case 'object':
            for (property in value) {
                ret = ret.concat([{
                    label: property,
                    data: item.map(function (_item) {
                        return [
                            new Date(_item.time * 1000),
                            _item.value[property]
                        ]
                    })
                }])
            }
            break;
        default:
    }
    return ret;
};
var Stat = {
    list: [],
    data: [],
    current: 0,
    type: 'sensor',
    loadsensor: function () {
        Stat.type = 'sensor';
    },
    loadcontroller: function () {
        Stat.type = 'controller';
    },
    loadlist: function () {
        m.request(
            {
                method: "POST",
                url: API,
                data: {
                    op: "stat",
                    id: 0,
                    type: Stat.type
                },
                withCredentials: true,
            }
        ).then(function (data) {
            if (data.errno == 0) {
                Stat.list = groupBy(data.value.value, 'id');
                Stat.list = Object.entries(Stat.list).map(([, v]) => v);
                // we know the array is not empty
                Stat.data = Stat.list.map(function (item) {
                    return {
                        name: item[0].name,
                        id: item[0].id,
                        // data is a array
                        data: divide(item, item[0].value)
                    }
                });
                Stat.current = 0;
                draw();
            }
            else {
                Stat.list = [data.msg];
            }
        })
    }
};
var StatList = {
    oninit: Stat.loadlist,
    view: function () {
        return [
            m(".field.has-addons",
                [
                    m(".control",
                        m(".select",
                            m("select[name='stat']",
                                {
                                    onchange: function (vnode) {
                                        Stat.current = vnode.target.selectedIndex;
                                    }
                                },
                                Stat.data.map(function (item, index) {
                                    return m("option",
                                        {
                                            value: index,
                                        },
                                        item.name
                                    )
                                })
                            )
                        )
                    ),
                    m(".control",
                        m("button.button.is-dark[type='submit']",
                            {onclick: draw},
                            "Choose"
                        )
                    )
                ]
            )]
    }
};