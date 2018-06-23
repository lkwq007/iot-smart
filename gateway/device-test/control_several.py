import socket, json, time

IP = '127.0.0.1'
PORT = 51001


def control(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP, PORT))
    print("Connected")
    print("Sent: ", data)
    s.sendall(bytes(json.dumps(data) + '\n', 'UTF-8'))
    s.close()


def run():
    device=[5,6,15,16,20,21]
    cmd = {"cmd": "setSwitch", "args": {"device_id": 5, "device_value": True}}
    for i in range(len(device)):
        cmd["args"]["device_id"]=device[i]
        control(cmd)
    cmd["args"]["device_value"]=False
    time.sleep(10)
    for i in range(len(device)):
        cmd["args"]["device_id"]=device[i]
        control(cmd)


if __name__ == "__main__":
    run()
