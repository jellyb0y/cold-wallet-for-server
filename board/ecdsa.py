import secp256k1
from binascii import hexlify


class ECDSA():
    Secret = None
    pubkey = None

    def __init__(self, Secret):
        self.Secret = Secret

    def get_pubkey(slef):
        if self.pubkey:
            return self.pubkey

        self.pubkey = secp256k1.ec_pubkey_create(secret)
        return self.pubkey

    def get_pubkey_hex(self):
        return hexlify(self.pubkey).decode()
