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
    print("Turn on the TV")
    on_cmd = {"cmd": "openTv", "args": {"device_id": 51}}
    control(on_cmd)
    print("TV is on")
    time.sleep(5)
    off_cmd = {"cmd": "closeTv", "args": {"device_id": 51}}
    control(off_cmd)
    print("TV is off")
    for i in range(10):
        control(on_cmd)
        for i in range(5):
            cmd={"cmd": "setChannel", "args": {"device_id": 51,"channel":i+1}}
            control(cmd)
            time.sleep(3)
            cmd={"cmd": "setVolume", "args": {"device_id": 51,"volume":i+1}}
            time.sleep(3)
            control(cmd)            
        time.sleep(3)
        control(off_cmd)
        time.sleep(3)


if __name__ == "__main__":
    run()
