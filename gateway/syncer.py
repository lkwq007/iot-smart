IP = '127.0.0.1'
PORT = 51001
URL = 'http://192.168.1.2/generic-iot/api.php'
import json
import socket
import requests
import multiprocessing as mp
# import schedule
import time


def get_gw_id():
    return "gw19"


def init_client(fd):
    setName = {'cmd': 'setName', 'args': {'name': get_gw_id()}}
    subscription = {"cmd": "subscription"}
    fd.write(json.dumps(setName) + '\n')
    fd.flush()
    ret = fd.readline()
    ret = json.loads(ret)
    if ret['errcode'] != 0:
        print('Error', ret['data'])
        return False
    fd.write(json.dumps(subscription) + '\n')
    fd.flush()
    ret = fd.readline()
    ret = json.loads(ret)
    if ret['errcode'] != 0:
        print('Error', ret['data'])
        return False
    return True


def control(id, value):
    cmd = {"cmd": "setSwitch", "args": {"device_id": id, "device_value": value}}
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    s.sendall(bytes(json.dumps(cmd) + '\n', 'UTF-8'))
    s.close()


def create(id, name, type, value):
    post = {'op': 'create', 'id': id, 'type': type, 'name': name,
            'value': value}
    ret = requests.post(URL, json=post)
    ret = ret.json()
    if ret['errno'] > 0:
        print('Error', ret['errno'], ret['msg'])
    return


def update(data, name):
    post = {'op': 'modify', 'id': data['device_id'], 'type': 'sensor', 'name': name,
            'value': data['device_value']}
    # print(post)
    ret = requests.post(URL, json=post)
    ret = ret.json()
    # print(ret)
    if ret['errno'] > 0:
        print('Error', ret['errno'], ret['msg'])
    if ret['errno'] == 5:
        create(data['device_id'], name, 'sensor', data['device_value'])
    return


def sync(array_):
    for dev in array_:
        if dev['id'] == 51:
            continue
        else:
            req = {"op": "query", "id": dev['id'], "type": "controller"}
            #print(req)
            ret = requests.post(URL, json=req)
            ret = ret.json()
            #print(ret)
            if ret['errno'] == 0:
                control(dev['id'], ret['value']['value'])
            elif ret['errno'] == 5:
                create(dev['id'], dev['name'], 'controller', False)
            else:
                print('Error', ret['errno'], ret['msg'])


def worker(type, dict_, array_):
    if type == 'sensor':
        print("Monitoring sensors...")
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((IP, PORT))
        fd = s.makefile('rw')
        init_client(fd)
        while (True):
            line = fd.readline()
            cmd = json.loads(line)
            if cmd['cmd'] == 'updateDevice':
                # print(cmd['args']['device_id'],cmd['args']['device_value'],'??')
                if cmd['args']['device_id'] in dict_:
                    update(cmd['args'], dict_[cmd['args']['device_id']]['name'])
        return
    else:
        # schedule.every(10).seconds.do(sync, array_)
        while True:
            # schedule.run_pending()
            sync(array_)
            time.sleep(5)
        return


def run():
    device = json.load(open('init.json', encoding='utf-8'))
    sensors = {}
    sensors_array = []
    controllers = {}
    controllers_array = []
    for item in device:
        if item['type'] == 'sensor':
            sensors[item['id']] = item
            sensors_array.append(item)
        else:
            controllers[item['id']] = item
            controllers_array.append(item)

    sensor_syncer = mp.Process(target=worker, args=('sensor', sensors, sensors_array,))
    controller_syncer = mp.Process(target=worker, args=('controller', controllers, controllers_array,))
    sensor_syncer.start()
    controller_syncer.start()
    sensor_syncer.join()
    controller_syncer.join()
    return


if __name__ == '__main__':
    run()
