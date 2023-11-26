import pyb


class Serial():
    def __init__(self, soft_reset = -1):
        self.usb_serial = pyb.USB_VCP()
        self.usb_serial.setinterrupt(soft_reset)

    def read_buf(self):
        buf = b''
        while ((not b'\r' in buf) and (not b'\n' in buf)):
            temp_buf = self.usb_serial.read()
            if temp_buf is not None:
                buf += temp_buf
        return buf.replace(b'\r', b'').replace(b'\n', b'')

    def read(self, wait=False):
        while True:
            if not self.usb_serial.any():
                if wait:
                    continue
                return None
            return self.read_buf()

    def write(self, msg, with_indent=True):
        if with_indent:
            msg += b'\r\n'
        self.usb_serial.write(msg)
