import secp256k1
import hashlib
from binascii import hexlify

import pyb

from serial import Serial
from secret import Secret
from ecdsa import ECDSA

import random

usb_serial = Serial(soft_reset=3)

secret = Secret()
ecdsa = ECDSA(secret)

def secp256k1_example():
    """Usage example for secp256k1 usermodule"""

    # randomize context from time to time
    # - it helps against sidechannel attacks
    # secp256k1.context_randomize(os.urandom(32))

    # some random secret key
    secret = hashlib.sha256(b"secret key").digest()

    print("Secret key:", hexlify(secret).decode())

    # Makes sense to check if secret key is valid.
    # It will be ok in most cases, only if secret > N it will be invalid
    if not secp256k1.ec_seckey_verify(secret):
        raise ValueError("Secret key is invalid")

    # computing corresponding pubkey
    pubkey = secp256k1.ec_pubkey_create(secret)

    # serialize the pubkey in compressed format
    sec = secp256k1.ec_pubkey_serialize(pubkey, secp256k1.EC_COMPRESSED)
    print("Public key:", hexlify(sec).decode())
 
    # this is how you parse the pubkey
    pubkey = secp256k1.ec_pubkey_parse(sec)

    # Signature generation:
 
    # hash of the string "hello"
    msg = hashlib.sha256(b"hello").digest()
    # signing
    sig = secp256k1.ecdsa_sign(msg, secret)
 
    # serialization
    der = secp256k1.ecdsa_signature_serialize_der(sig)

    print("Signature:", hexlify(der).decode())

    # verification
    if secp256k1.ecdsa_verify(sig, msg, pubkey):
        print("Signature is valid")
    else:
        printf("Invalid signature")

if __name__ == '__main__':
    secp256k1_example()


def mainCycle():
    buf = usb_serial.read(wait=True)

    if buf == b'PING':
        usb_serial.write(b'PONG')
    elif buf == b'SECRET_RESET':
        if secret.generate():
            usb_serial.write(b'OK')
        else:
            usb_serial.write(b'FAIL')
    elif buf == b'GET_PUBKEY':
        pubkey = bytearray(ecdsa.get_pubkey_hex())
        usb_serial.write(pubkey)

while True:
    mainCycle()
