import socket, json

IP = '127.0.0.1'
PORT = 51001


def query(data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # assume that it would always success
    s.connect((IP, PORT))
    print("Connected")
    print("\"", data, "\" sent")
    s.sendall(bytes(json.dumps(data) + '\n', "UTF-8"))
    ret = s.recv(1024)
    s.close()
    return (ret)


def run():
    print("Querying...")
    data = {"cmd": "query", "args": {"device_id": 40}}
    ret = query(data)
    ret = json.loads(str(ret, encoding="UTF-8"))
    print("\"", ret, "\" received")
    print("Errcode: ", ret["errcode"])
    print("Data: ", ret["data"])


if __name__ == "__main__":
    run()
