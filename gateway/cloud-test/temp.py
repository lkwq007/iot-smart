import json
import requests
import socket
import gw_config

IP = gw_config.IP
PORT = gw_config.PORT
URL = gw_config.URL + 'temp.php'


def getGwId():
    return "gw19"


def initClient(fd):
    setName = {'cmd': 'setName', 'args': {'name': getGwId()}}
    subscription = {"cmd": "subscription", "args": {"device_id": 40}}
    fd.write(json.dumps(setName) + '\n')
    fd.flush()
    ret = fd.readline()
    ret = json.loads(ret)
    if ret['errcode'] != 0:
        print(ret['data'])
        return
    fd.write(json.dumps(subscription) + '\n')
    fd.flush()
    ret = fd.readline()
    ret = json.loads(ret)
    if ret['errcode'] != 0:
        print(ret['data'])
        return


def update(temperature):
    data = {'temperature': temperature}
    ret = requests.post(URL, json=data)
    ret = ret.json()
    if ret['errno'] > 0:
        print(ret['errno'], ret['msg'])
    return


def run():
    print("Monitoring sensors...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    fd = s.makefile('rw');
    initClient(fd)
    while (True):
        line = fd.readline()
        data = json.loads(line)
        if data['cmd'] == 'updateDevice':
            temperature = data["args"]["device_value"]["temperature"]
            update(temperature)


if __name__ == '__main__':
    run()
