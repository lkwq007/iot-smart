<?php
/**
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/1
 * Time: 14:51
 */
# db config
require_once 'config.php';
# get post json
$json_post = json_decode(file_get_contents('php://input'), true);
header('Content-Type: application/json');
# input filter
if (array_key_exists('cmd', $json_post) && array_key_exists('id', $json_post) && $json_post['cmd'] == 'query') {
    # input filter
    $id = $json_post['id'];
    if (!is_numeric($id)) {
        echo json_encode(array("errno" => 2, "msg" => "Illegal ID", "value" => "$id"));
        exit(0);
    }
    # assume it would success
    $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME", $DB_USER, $DB_PASS);
    $stm = $db->prepare("SELECT * FROM controller WHERE id=?");
    $stm->execute(array($id));
    $result = $stm->fetchAll(PDO::FETCH_ASSOC);
    if (count($result) > 0) {
        echo json_encode(array("errno" => 0, "msg" => "Query succeed", "value" => $result[0]['value']));
    } else {
        echo json_encode(array("errno" => 3, "msg" => "Device not exist", "value" => "$id"));
    }
} else {
    echo json_encode(array("errno" => 1, "msg" => "Undefined cmd", "value" => ""));
    exit(0);
}
?>