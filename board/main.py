import secp256k1
import hashlib
from binascii import hexlify, unhexlify

import pyb

from serial import Serial
from secret import Secret
from ecdsa import ECDSA

import random

usb_serial = Serial(soft_reset=3)

secret = Secret()
ecdsa = ECDSA(secret)

DEBUG = False

def mainCycle():
    global DEBUG
    buf = usb_serial.read(wait=True)

    if buf == b'PING':
        usb_serial.write(b'PING:PONG')
    if buf == b'DEBUG':
        DEBUG = usb_serial.read(wait=True) == b'1'
    elif buf == b'SECRET_RESET':
        try:
            sec_key = secret.generate()
            secret.set_secret(sec_key)
            usb_serial.write(b'SECRET_RESET:OK')
        except Exception as e:
            if DEBUG:
                print(e)
            usb_serial.write(b'SECRET_RESET:FAIL')
    elif buf == b'SECRET_SET':
        try:
            sec_key_der = usb_serial.read(wait=True)
            secret.set_secret_der(sec_key_der)
            usb_serial.write(b'SECRET_SET:OK')
        except Exception as e:
            if DEBUG:
                print(e)
            usb_serial.write(b'SECRET_SET:FAIL')
    elif buf == b'GET_PUBKEY':
        try:
            pubkey = ecdsa.get_pubkey_hex()
            usb_serial.write(b'GET_PUBKEY:' + bytearray(pubkey))
        except Exception as e:
            if DEBUG:
                print(e)
            usb_serial.write(b'GET_PUBKEY:FAIL')
    elif buf == b'SIGN':
        try:
            msg = usb_serial.read(wait=True)
            sign = ecdsa.make_sign_hex(msg)
            usb_serial.write(b'SIGN:' + bytearray(sign))
        except Exception as e:
            if DEBUG:
                print(e)
            usb_serial.write(b'SIGN:FAIL')
    elif buf == b'VERIFY':
        try:
            der = usb_serial.read(wait=True)
            msg = usb_serial.read(wait=True)
            pubkey = usb_serial.read(wait=True)

            result = ecdsa.verify_sig(der, msg, pubkey)
            usb_serial.write(b'VERIFY:' + (b'1' if result else b'0'))
        except Exception as e:
            if DEBUG:
                print(e)
            usb_serial.write(b'VERIFY:FAIL')

while True:
    mainCycle()
