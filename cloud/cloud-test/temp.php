<?php
# db config
require_once 'config.php';
# get post json
$json_post = json_decode(file_get_contents('php://input'), true);
$temperature = $json_post['temperature'];
header('Content-Type: application/json');
# input filter
if (!is_numeric($temperature)) {
    echo json_encode(array("errno" => 1, "msg" => "Illegal post!"));
    die();
}
# assume it would success
$db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME", $DB_USER, $DB_PASS);
$stm = $db->prepare("SELECT * FROM sensor WHERE id=0");
$stm->execute();
$result = $stm->fetchAll(PDO::FETCH_ASSOC);
if (count($result) > 0) {
    $stm = $db->prepare("UPDATE sensor SET value=? WHERE id=0");
    $ret = $stm->execute(array($temperature));
} else {
    $stm = $db->prepare("INSERT INTO sensor(id,name,type,value) VALUES(?,?,?,?)");
    $ret = $stm->execute(array(0, "temperature", "40", $temperature));
}

if ($ret) {
    echo json_encode(array("errno" => 0, "msg" => "Insertion success, temperature: $temperature"));
} else {
    echo json_encode(array("errno" => 2, "msg" => "Insertion failed, temperature: $temperature"));
}
?>