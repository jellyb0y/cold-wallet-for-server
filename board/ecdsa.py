import secp256k1
import hashlib
from binascii import hexlify, unhexlify
import random


class ECDSA():
    Secret = None

    def __init__(self, Secret):
        self.Secret = Secret

    def get_pubkey(self):
        secret = self.Secret.get_secret()
        pubkey_decompressed = secp256k1.ec_pubkey_create(secret)
        return secp256k1.ec_pubkey_serialize(pubkey_decompressed, secp256k1.EC_COMPRESSED)

    def get_pubkey_hex(self):
        pubkey = self.get_pubkey()
        return hexlify(pubkey).decode()

    def make_sign(self, msg):
        random_bytes = bytearray(random.getrandbits(8) for _ in range(256))
        random_seed = hashlib.sha256(random_bytes).digest()

        msg_hash = hashlib.sha256(msg).digest()
        secret = self.Secret.get_secret()

        sig = secp256k1.ecdsa_sign(msg_hash, secret, None, random_seed)
        return secp256k1.ecdsa_signature_serialize_der(sig)
    
    def make_sign_hex(self, msg):
        sign = self.make_sign(msg)
        return hexlify(sign).decode()

    def verify_sig(self, der_hex, msg, pubkey_compressed):
        der = unhexlify(der_hex)
        pubkey_decompressed = secp256k1.ec_pubkey_parse(unhexlify(pubkey_compressed))

        msg_hash = hashlib.sha256(msg).digest()
        sig = secp256k1.ecdsa_signature_parse_der(der)

        return secp256k1.ecdsa_verify(sig, msg_hash, pubkey_decompressed)

