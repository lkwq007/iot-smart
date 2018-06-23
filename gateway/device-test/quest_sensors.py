import socket, json

IP = '127.0.0.1'
PORT = 51001


def getGwId():
    return "gw19"


def initClient(fd):
    setName = {'cmd': 'setName', 'args': {'name': getGwId()}}
    subscription = {"cmd": "subscription"}

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


def run():
    print("monitoring sensors...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    fd = s.makefile('rw');
    initClient(fd)
    while (True):
        line = fd.readline()
        cmd = json.loads(line)
        if cmd['cmd'] == 'updateDevice':
            data = cmd['args']
            dvid = data['device_id']
            print(cmd)
            print(data)
            print('\n')


if __name__ == '__main__':
    run()
