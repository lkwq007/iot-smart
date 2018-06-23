<?php
/**
 * Created by PhpStorm.
 * User: lnyan
 * Date: 2017/12/27
 * Time: 20:43
 */

class Response
{
    const ERR_SUCCESS=0;
    const ERR_SYNTAX=1;
    const ERR_FORMAT=2;
    const ERR_DB=3;
    const ERR_EXIST=4;
    const ERR_NOTEXIST=5;
    const ERR_UNKNOWN=6;
    static $error_msg = array(
        self::ERR_SUCCESS => "Success",
        self::ERR_SYNTAX => "Json syntax error",
        self::ERR_FORMAT => "Json format is not correct",
        self::ERR_DB => "Database access exception",
        self::ERR_EXIST=>"Device already exist",
        self::ERR_NOTEXIST=>"Device not exist",
        self::ERR_UNKNOWN => "Unknown error"
    );

    public $errno = 0;
    public $msg = "";
    public $value = null;

    private function validate($errno)
    {
        if ($errno > Response::ERR_UNKNOWN || $errno < 0) {
            $errno = Response::ERR_UNKNOWN;
        }
        $this->errno = $errno;
        $this->msg = Response::$error_msg[$errno];
    }

    function __construct($errno = 0, $value = null)
    {
        $this->validate($errno);
        $this->value = $value;
    }

    public function alter($errno, $value = null)
    {
        $this->validate($errno);
        $this->value = $value;
    }

    public function send()
    {
        header('Content-Type: application/json');
        echo json_encode($this);
    }
}