<?php
/**
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/27
 * Time: 20:23
 */
$url = 'http://127.0.0.1/device.json';
require_once "autoload.php";
$store = new Jsv4\SchemaStore();
$schema = json_decode(file_get_contents("./schemas/device.json"));
$store->add($url, $schema);
$retrieved = $store->get($url);
//$data = json_decode(file_get_contents("./schemas/data.json"));
$data = json_decode(file_get_contents("php://input"));
$resp=new Response(Response::ERR_SUCCESS);
if (!isset($data)) {
    $resp->alter(Response::ERR_SYNTAX);
} else {
    $result = Jsv4\Validator::validate($data, $retrieved);
    if ($result->valid) {
        switch($data->op)
        {
            case "create":
            case "modify":
            case "query":
            case "delete":
            case "query_all":
            case "stat":
                $device=new Device($data);
                $op=$data->op;
                $ret=$device->$op();
                $device->serialize();
                $resp->alter($ret,$device);
                break;
            default:
                // unlikely hit, but we shall handle this in case
                $resp->alter(Response::ERR_UNKNOWN);
        }
    } else {
        $resp->alter(Response::ERR_FORMAT);

    }
}
$resp->send();