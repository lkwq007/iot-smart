import requests
import json
import gw_config

URL = gw_config.URL + 'setonoff.php'


def run():
    data = {'cmd': 'set', 'value': '1'}
    ret = requests.post(URL, json=data)
    ret = ret.json()
    print(ret['errno'], ret['msg'])


if __name__ == '__main__':
    run()
