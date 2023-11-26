import hashlib
import random
from binascii import hexlify

FILE_PATH = '/flash/secret'


class Secret():
    secret = None
    secret_size = None

    def __init__(self, secret_size = 64):
        self.secret_size = secret_size

    def get_secret(self):
        if self.secret is not None:
            return self.secret

        try:
            with open(FILE_PATH, 'rb') as file:
                self.secret = file.read(self.secret_size)
                return self.secret
        except:
            return None
    
    def generate(self):
        random_bytes = bytearray(random.getrandbits(8) for _ in range(256))
        self.secret = hexlify(hashlib.sha256(random_bytes).digest())
        return self.secret

    def set_secret(self, secret):
        self.secret = secret

        with open(FILE_PATH, 'wb') as file:
            file.write(self.secret)
            return self.secret
