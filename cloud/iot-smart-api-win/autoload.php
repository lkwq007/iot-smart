<?php
/**
 * dispatch all class loading
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/27
 * Time: 14:41
 */
spl_autoload_register(function ($class) {
    if ($class == "Flight") {
        include __DIR__ . '/classes/flight/' . $class . '.php';
    } else {
        include __DIR__ . '/classes/' . $class . '.php';
    }
});