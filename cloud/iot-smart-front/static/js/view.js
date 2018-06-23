var pages = [["/", "Home"], ["/dashboard/main", "Dashboard"], ["/about", "About"]];
var subpages = [
    {label: "General"}, {list: [["main", "Main"], ["device", "Devices List"]]},
    {label: "Statistics"}, {list: [["sensor-stat", "Sensor Statistics"], ["controller-stat", "Controller Statistics"]]}
];
var isHome = false;
var isActive = false;
var toggle = function () {
    isActive = !isActive;
};
var header_content = {
    view: function () {
        if (isActive) {
            _burger = "span.is-active.navbar-burger.burger[data-target='navbarMenu'][id='burger']";
            _menu = ".navbar-menu.is-active[id='navbarMenu']";
        }
        else {
            _burger = "span.navbar-burger.burger[data-target='navbarMenu'][id='burger']";
            _menu = ".navbar-menu[id='navbarMenu']";
        }
        return [
            m(".hero-head",
                m("nav.navbar",
                    m(".container",
                        [
                            m(".navbar-brand",
                                [
                                    m("a.navbar-item[href='/']", {
                                            oncreate: m.route.link
                                        },
                                        [
                                            m("img.logo[alt=''][src='static/img/iot_logomark.png']"),
                                            m("h1.title.is-5",
                                                "IOT-Smart"
                                            )
                                        ]
                                    ),
                                    m(_burger,
                                        {
                                            onclick: toggle
                                        },
                                        [
                                            m("span"),
                                            m("span"),
                                            m("span")
                                        ]
                                    )
                                ]
                            ),
                            m(_menu,
                                m(".navbar-start",
                                    pages.map(function (item) {
                                        var _path, _name, style;
                                        [_path, _name] = item;
                                        if (_path == m.route.get()) {
                                            style = "a.navbar-item.is-active";
                                        }
                                        else {
                                            style = "a.navbar-item";
                                        }
                                        return m(style, {
                                            href: _path, oncreate: m.route.link, onupdate: m.route.link
                                        }, _name);

                                    })
                                )
                            )
                        ]
                    )
                )
            ),
            isHome ? [
                m(".hero-body",
                    m(".container.has-text-centered",
                        [
                            m("img[src='static/img/iot_logomark.svg'][width='160px']"),
                            m("h1.title",
                                "A single-page application for"
                            ),
                            m("h2.subtitle",
                                m("a[href='http://jwbinfosys.zju.edu.cn/html_kc/67180050.html']",
                                    "Modern Mobile Communication Application\
                                          System Experiment"
                                )
                            ),
                            m("h3.subtitle",
                                [
                                    "By ",
                                    m("a[href='https://llonely.com']",
                                        "Yuan Liu"
                                    )
                                ]
                            ),
                            m("h3",
                                m("a.button.is-dark[href='/dashboard/main']",
                                    {
                                        oncreate: m.route.link
                                    },
                                    "Get Started"
                                )
                            )
                        ]
                    )
                ),
                m(".hero-foot",
                    m(".container",
                        m(".tabs.is-centered.is-light",
                            m("ul",
                                m("li",
                                    m("a",
                                        "Powered by Bulma and Mithril.js"
                                    )
                                )
                            )
                        )
                    )
                ),
            ] : null
        ];
    }
}

var header = {
    view: function () {
        if (m.route.get() == "/") {
            isHome = true;
        }
        else {
            isHome = false;
        }
        if (isHome) {
            return m("section.hero.is-light.is-bold.is-fullheight", m(header_content));
        }
        else {
            return m("section.hero.is-light.is-bold", m(header_content));
        }
    }
};
var sidebar = {
    view: function () {
        return (
            m(".column.is-one-quarter-desktop.is-sidebar-menu.is-narrow-tablet",
                m("aside.menu",
                    subpages.map(function (item) {
                        if ('label' in item) {
                            return m("p.menu-label",
                                item.label
                            );
                        }
                        else if ('list' in item) {
                            return m("ul.menu-list",
                                item.list.map(function (_item) {
                                    [_path, _name] = _item;
                                    if (m.route.param('key') == _path) {
                                        sel = "a.is-active";
                                    }
                                    else {
                                        sel = "a";
                                    }
                                    _path = "/dashboard/" + _path
                                    return m("li",
                                        m(sel, {href: _path, oncreate: m.route.link, onupdate: m.route.link},
                                            _name
                                        )
                                    )
                                })
                            )
                        }
                    })
                    /*[
                        m("p.menu-label",
                            "General"
                        ),
                        m("ul.menu-list",
                            [
                                m("li",
                                    m("a.is-active",
                                        "Main"
                                    )
                                ),
                                m("li",
                                    m("a",
                                        "Devices List"
                                    )
                                )
                            ]
                        ),
                        m("p.menu-label",
                            "Statistics"
                        ),
                        m("ul.menu-list",
                            [
                                m("li",
                                    m("a",
                                        "Sensor Statistics"
                                    )
                                ),
                                m("li",
                                    m("a",
                                        "Controller Statistics"
                                    )
                                )
                            ]
                        )
                    ]*/
                )
            )
        );
    }
};

var panel = {
    view: function () {
        var _key = m.route.param('key');
        switch (_key) {
            case 'main':
                return m(".column.is-main-content",
                    [
                        m(".heading",
                            "Summary"
                        ),
                        m(".columns",
                            [
                                m(".column.is-one-quarter",
                                    m(".box.notification.has-text-centered",
                                        [
                                            m("p.heading",
                                                "Sensors"
                                            ),
                                            m("p.title[id='a']",
                                                Sensor.list.length
                                            )
                                        ]
                                    )
                                ),
                                m(".column.is-one-quarter",
                                    m(".box.notification.has-text-centered",
                                        [
                                            m("p.heading",
                                                "Controller"
                                            ),
                                            m("p.title",
                                                Controller.list.length
                                            )
                                        ]
                                    )
                                ),
                                m(".column.is-one-quarter",
                                    m(".box.notification.has-text-centered",
                                        [
                                            m("p.heading",
                                                "Error"
                                            ),
                                            m("p.title",
                                                0
                                            )
                                        ]
                                    )
                                ),
                                m(".column.is-one-quarter",
                                    m(".box.notification.has-text-centered",
                                        [
                                            m("p.heading",
                                                "Alert"
                                            ),
                                            m("p.title",
                                                0
                                            )
                                        ]
                                    )
                                )
                            ]
                        ),
                        m(".heading",
                            "Sensors - Last sync: " + new Date(Sensor.sync)
                        ),
                        m(SensorList),
                        m(".heading",
                            "Controllers - Last sync: " + new Date(Controller.sync)
                        ),
                        m(".card",
                            m(ControllerList)
                        ),
                        footer
                    ]
                );
            case 'device':
                return m(".column.is-main-content",
                    [
                        m(".heading",
                            "Devices - Last sync: " + new Date(Device.sync)
                        ),
                        m(".card",
                            m(DeviceList)
                        ),
                        footer
                    ]
                );
            case 'sensor-stat':
                Stat.loadsensor();
                return m(".column.is-main-content",
                    [
                        m(".heading",
                            "Sensors"
                        ),
                        m(".card",
                            [m("", {
                                id: "chart",
                                style: "width:100%; height:400px;"
                            }), m(StatList)]
                        ),
                        footer
                    ]
                );
            case 'controller-stat':
                Stat.loadcontroller();
                return m(".column.is-main-content",
                    [
                        m(".heading",
                            "Controllers"
                        ),
                        m(".card",
                            [m("", {
                                id: "chart",
                                style: "width:100%; height:400px;"
                            }), m(StatList)]
                        ),
                        footer
                    ]
                );
            default:
                return m('', 'will not appear');
        }
    }
}

var content = {
    view: function () {
        return m("[class='']",
            m(".columns.is-fullheight", {style: {"margin-top": "0rem"}},
                [
                    m(sidebar),
                    m(panel)
                ]
            )
        );
    }
}

var about = {
    view: function () {
        return [
            m("section.hero.is-light.is-bold.is-medium",
                m(".hero-body",
                    m(".container",
                        [
                            m("h1.title",
                                "IOT-Smart"
                            ),
                            m("h2.subtitle",
                                "for Modern Mobile Communication Application System Experiment"),
                            m("h2.subtitle",
                                [
                                    m("p", "Yuan Liu"),
                                    m("p", "Email: lkwq007@gmail.com"),
                                    m("p", [
                                        "Site: ",
                                        m("a[href='https://llonely.com']", "llonely.com")
                                    ])
                                ]
                            )
                        ]
                    )
                )
            ),
            m("footer.footer",
                m("[class='']",
                    m(".content.has-text-centered",
                        m("p",
                            [
                                m("strong",
                                    "IOT-Smart"
                                ),
                                " by ",
                                m("a[href='https://www.llonely.com']",
                                    "Yuan Liu"
                                ),
                                ". Powered by ",
                                m("a[href='https://bulma.io']",
                                    "Bulma"
                                ),
                                " and ",
                                m("a[href='https://mithril.js.org']",
                                    "Mithril.js"
                                ),
                                "."
                            ]
                        )
                    )
                )
            )
        ]
    }
};

// the site footer for dashboard
var footer =
    m(".footer", {style: {"padding-bottom": "3rem"}},
        m("[class='']",
            m(".content.has-text-centered",
                m("p",
                    [
                        m("strong",
                            "IOT-Smart"
                        ),
                        " by ",
                        m("a[href='https://www.llonely.com']",
                            "Yuan Liu"
                        ),
                        ". Powered by ",
                        m("a[href='https://bulma.io']",
                            "Bulma"
                        ),
                        " and ",
                        m("a[href='https://mithril.js.org']",
                            "Mithril.js"
                        ),
                        "."
                    ]
                )
            )
        )
    )