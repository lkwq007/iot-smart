import socket, json, time

IP = '127.0.0.1'
PORT = 51001


def query(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # assume that it would always success
    s.connect((IP, PORT))
    # print("Connected")
    # print("Sent: ", data)
    s.sendall(bytes(json.dumps(data) + '\n', "UTF-8"))
    ret = s.recv(1024)
    s.close()
    return (ret)


def control(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    # print("Connected")
    # print("Sent: ", data)
    s.sendall(bytes(json.dumps(data) + '\n', 'UTF-8'))
    s.close()


def heater(signal):
    cmd = {"cmd": "setSwitch", "args": {"device_id": 9, "device_value": signal}}
    control(cmd)


def fan(signal):
    device=[15,16]
    for i in range(2):
        cmd = {"cmd": "setSwitch", "args": {"device_id": device[i], "device_value": signal}}
        control(cmd)


def run():
    device = [40, 41, 42]
    print("Querying...")
    data = {"cmd": "query", "args": {"device_id": 40}}
    while True:
        temp = 0
        for i in range(3):
            data["args"]["device_id"] = device[i]
            ret = query(data)
            ret = json.loads(str(ret, encoding="UTF-8"))
            temp += ret["data"]["device_value"]["temperature"]
        temp /= 3.0
        print("Current avg temperature:", temp)
        if (temp < 23.5):
            fan(False)
            heater(True)
        elif (temp >= 23.5 and temp < 24):
            fan(False)
            heater(False)
        else:
            fan(True)
            heater(False)
        time.sleep(5)


if __name__ == "__main__":
    run()

