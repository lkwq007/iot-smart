<?php
/**
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/13
 * Time: 15:13
 */
# db config
/**
 * @param $errno
 * @param $msg
 * @param $value
 */
function response($errno, $msg, $value)
{
    header('Content-Type: application/json');
    echo json_encode(array("errno" => $errno, "msg" => $msg, "value" => $value));
    if ($errno > 0) {
        exit(0);
    }
    return;
}

require_once 'config.php';
# get post json
$json_post = json_decode(file_get_contents('php://input'), true);
# we shall handle this json in a decent way
if (isset($json_post) && array_key_exists('cmd', $json_post) && array_key_exists('value', $json_post)) {
    if ($json_post['cmd'] == 'set' && is_numeric($json_post['value'])) {
        $cmd = $json_post["cmd"];
        $value = $json_post['value']==1?"true":"false";
    } else {
        response(2, "Illegal value", "");
    }
} else {
    response(1, "Illegal post", "");
}

# assume it would success
$db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME", $DB_USER, $DB_PASS);
$stm = $db->prepare("SELECT * FROM controller WHERE id=0");
$stm->execute();
$result = $stm->fetchAll(PDO::FETCH_ASSOC);
if (count($result) > 0) {
    $stm = $db->prepare("UPDATE controller SET value=? WHERE id=0");
    $ret = $stm->execute(array($value));
} else {
    $stm = $db->prepare("INSERT INTO controller(id,name,type,value) VALUES(?,?,?,?)");
    $ret = $stm->execute(array(0, "LED", "5", "$value"));
}
if ($ret) {
    response(0, "Set success", $value);
} else {
    response(3, "Set fail", $value);
}
?>