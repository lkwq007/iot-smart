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
    print("Turn on the LED1")
    on_cmd = {"cmd": "setSwitch", "args": {"device_id": 5, "device_value": True}}
    control(on_cmd)
    print("LED1 is on")
    time.sleep(5)
    off_cmd = {"cmd": "setSwitch", "args": {"device_id": 5, "device_value": False}}
    control(off_cmd)
    print("LED1 is off")
    for i in range(10):
        control(on_cmd)
        time.sleep(2)
        control(off_cmd)
        time.sleep(2)


if __name__ == "__main__":
    run()
