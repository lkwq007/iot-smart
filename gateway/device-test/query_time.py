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


def run():
    device = [(40, "t"), (41, "t"), (42, "t"), (43, "l"), (44, "l"), (45, "l"), (50, "s")]
    print("Querying...")
    data = {"cmd": "query", "args": {"device_id": 40}}
    while True:
        for i in range(7):
            data["args"]["device_id"], type = device[i]
            ret = query(data)
            ret = json.loads(str(ret, encoding="UTF-8"))
            if type == "t":
                print("Temperature-humidity sensor ID:", data["args"]["device_id"], " Temperature:",
                      ret["data"]["device_value"]["temperature"],
                      " Humidity:", ret["data"]["device_value"]["humidity"])
            elif type == "l":
                print("Light sensor ID:", data["args"]["device_id"], " Lightness:", ret["data"]["device_value"])
            else:
                print("6-axes ID:", data["args"]["device_id"], " Value:", ret["data"]["device_value"])
        print("Waiting...\n")
        time.sleep(5)


if __name__ == "__main__":
    run()
