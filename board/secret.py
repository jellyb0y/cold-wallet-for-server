import secp256k1
import hashlib
import random
from binascii import hexlify, unhexlify

FILE_PATH = '/flash/private.key'


class Secret():
    secret = None

    def get_secret(self):
        with open(FILE_PATH, 'rb') as file:
            secret = file.read()

            if not secp256k1.ec_seckey_verify(secret):
                raise ValueError("Secret key is invalid")

            return secret
    
    def generate(self):
        random_bytes = bytearray(random.getrandbits(8) for _ in range(256))
        secret = hashlib.sha256(random_bytes).digest()
        return secret

    def set_secret(self, secret):
        with open(FILE_PATH, 'wb') as file:
            file.write(secret)

    def set_secret_der(self, secret_der):
        secret = unhexlify(secret_der)
        self.set_secret(secret)
