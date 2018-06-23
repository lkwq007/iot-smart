import time
import json
import requests
import socket
import gw_config

IP = gw_config.IP
PORT = gw_config.PORT
URL = gw_config.URL + 'led.php'

def control(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    # print("Connected")
    # print("Sent: ", data)
    s.sendall(bytes(json.dumps(data) + '\n', 'UTF-8'))
    s.close()


def run():
    on_cmd = {"cmd": "setSwitch", "args": {"device_id": 5, "device_value": True}}
    off_cmd = {"cmd": "setSwitch", "args": {"device_id": 5, "device_value": False}}
    req = {"cmd": "query", "id": 0}
    while True:
        ret = requests.post(URL, json=req);
        ret = ret.json()
        if ret['errno'] == 0:
            if (ret['value'] == 'true'):
                control(on_cmd)
            else:
                control(off_cmd)
        else:
            print(ret['errno'], ret['msg'])
        time.sleep(5)


if __name__ == "__main__":
    run()
