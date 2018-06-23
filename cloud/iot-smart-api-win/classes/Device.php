<?php
/**
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/27
 * Time: 15:48
 */

// database config
require_once __DIR__ . "/../config.php";
// need status code from Response
require_once "Response.php";

class FakeDevice
{
    public $id;
    public $name;
    public $type;
    public $value;

    function __construct($id, $name, $type, $value)
    {
        $this->id = intval($id);
        $this->name = $name;
        $this->type = $type;
        $this->value = json_decode($value);
    }
}

class Log
{
    public $id;
    public $name;
    public $time;
    public $value;

    function __construct($id, $name, $time, $value)
    {
        $this->id = intval($id);
        $this->name = $name;
        $this->time = intval($time);
        $this->value = json_decode($value);
    }
}

function wrapper($data)
{
    $ret = array();
    foreach ($data as $item) {
        $temp = new FakeDevice($item['id'], $item['name'], $item['type'], $item['value']);
        array_push($ret, $temp);
    }
    return $ret;
}

function log_wrapper($data)
{
    $ret = array();
    foreach ($data as $item) {
        $temp = new Log($item['id'], $item['name'], $item['time'], $item['value']);
        array_push($ret, $temp);
    }
    return $ret;
}

class Device
{
    private $db;
    private $data;
    public $id;
    public $name;
    public $type;
    public $value;

    function __construct($data)
    {
        $this->data = $data;
        $this->id = $data->id;
    }

    public function serialize()
    {
        if (is_string($this->value)) {
            $this->value = json_decode($this->value);
        }
        //return $this;
    }

    public function connect()
    {
        try {
            $this->db = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                array(PDO::ATTR_PERSISTENT => true)
            );
        } catch (PDOException $e) {
            $this->db = null;
            return 1;
        }
        return 0;
    }

    public function stat()
    {
        $type = $this->data->type;
        // to reuse $this->connect, this method is not static
        // can construct a dummy object, then use this method
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        try {
            switch ($type) {
                case "sensor":
                    $stmt = $this->db->prepare("SELECT sensor.id,sensor.name,UNIX_TIMESTAMP(log.time) AS time,log.value FROM sensor,log WHERE sensor.id=log.id AND log.type='sensor' ORDER BY log.time");
                    # $stmt = $this->db->prepare("SELECT sensor.id,sensor.name,UNIX_TIMESTAMP(log.time) AS time,log.value FROM sensor,log WHERE sensor.id=log.id ORDER BY log.time");
                    break;
                case "controller":
                    $stmt = $this->db->prepare("SELECT controller.id,controller.name,UNIX_TIMESTAMP(log.time) AS time,log.value FROM controller,log WHERE controller.id=log.id AND log.type='controller' ORDER BY log.time");
                    # $stmt = $this->db->prepare("SELECT controller.id,controller.name,UNIX_TIMESTAMP(log.time) AS time,log.value FROM controller,log WHERE controller.id=log.id ORDER BY log.time");
                    break;
                default:
                    // not hit
                    $stmt = $this->db->prepare("SELECT * FROM log");
                    break;
            }
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->value = log_wrapper($result);
            return Response::ERR_SUCCESS;
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
    }

    public function query_all()
    {
        $type = $this->data->type;
        // to reuse $this->connect, this method is not static
        // can construct a dummy object, then use this method
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        try {
            switch ($type) {
                case "sensor":
                    $stmt = $this->db->prepare("SELECT * FROM sensor");
                    break;
                case "controller":
                    $stmt = $this->db->prepare("SELECT * FROM controller");
                    break;
                default:
                    $stmt = $this->db->prepare("SELECT * FROM sensor UNION SELECT * FROM controller");
                    break;
            }
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->value = wrapper($result);
            return Response::ERR_SUCCESS;
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
    }

    private function check_exist($save = false)
    {
        if (isset($this->type)) {
            $stmt = $this->db->prepare("SELECT * FROM $this->type WHERE id=?");
            $stmt->execute(array($this->id));
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (count($result) > 0) {
                goto save_check;
            }
        } else {
            $stmt_controller = $this->db->prepare("SELECT * FROM controller WHERE id=?");
            $stmt_controller->execute(array($this->id));
            $result_controller = $stmt_controller->fetchAll(PDO::FETCH_ASSOC);
            $stmt_sensor = $this->db->prepare("SELECT * FROM sensor WHERE id=?");
            $stmt_sensor->execute(array($this->id));
            $result_sensor = $stmt_sensor->fetchAll(PDO::FETCH_ASSOC);
            if (count($result_controller) > 0) {
                $this->type = "controller";
                $result = $result_controller;
                goto save_check;
            }
            if (count($result_sensor) > 0) {
                $this->type = "sensor";
                $result = $result_sensor;
                goto save_check;
            }
        }
        return 0;

        save_check:
        if ($save) {
            $this->name = $result[0]['name'];
            $this->value = json_decode($result[0]['value']);
        }
        return 1;
    }

    private function insert()
    {
        $stmt = $this->db->prepare("INSERT INTO $this->type (id,name,type,value) VALUES(:id,:name,:type,:value)");
        $ret = $stmt->execute(
            array(
                ":id" => $this->id,
                ":name" => $this->name,
                ":type" => $this->type,
                ":value" => json_encode($this->value)
            )
        );
        if ($ret) {
            return 0;
        }
        return 1;
    }

    private function update()
    {
        // assume type cannot be modified
        $bind = array(
            ":id" => $this->id
        );
        if (isset($this->data->name)) {
            $sql_name = "name=:name,";
            $bind[':name'] = $this->data->name;
            $this->name = $this->data->name;
        } else {
            $sql_name = "";
        }
        if (isset($this->data->value)) {
            $sql_value = "value=:value,";
            $bind[":value"] = json_encode($this->data->value);
            $this->value = $this->data->value;
        } else {
            $sql_value = "";
        }
        $stmt = $this->db->prepare("UPDATE $this->type SET " . $sql_value . $sql_name . "id=:id WHERE id=:id");
        $ret = $stmt->execute($bind);
        return !$ret;
    }

    private function remove()
    {
        $stmt = $this->db->prepare("DELETE FROM $this->type WHERE id=?");
        $ret = $stmt->execute(array($this->id));
        return !$ret;
    }

    public function create()
    {
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        $this->type = $this->data->type;
        $this->name = $this->data->name;
        $this->value = $this->data->value;
        try {
            if ($this->check_exist()) {
                return Response::ERR_EXIST;
            }
            if ($this->insert()) {
                return Response::ERR_UNKNOWN;
            }
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
        return Response::ERR_SUCCESS;
    }

    public function modify()
    {
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        try {
            if (!$this->check_exist()) {
                return Response::ERR_NOTEXIST;
            }
            if ($this->update()) {
                return Response::ERR_UNKNOWN;
            }
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
        return Response::ERR_SUCCESS;
    }

    public function query()
    {
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        try {
            if (!$this->check_exist(true)) {
                return Response::ERR_NOTEXIST;
            }
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
        return Response::ERR_SUCCESS;
    }

    public function delete()
    {
        if ($this->connect()) {
            return Response::ERR_DB;
        }
        try {
            if (!$this->check_exist(true)) {
                return Response::ERR_NOTEXIST;
            }
            if ($this->remove()) {
                return Response::ERR_UNKNOWN;
            }
        } catch (PDOException $e) {
            $this->db = null;
            return Response::ERR_UNKNOWN;
        }
        return Response::ERR_SUCCESS;
    }
}