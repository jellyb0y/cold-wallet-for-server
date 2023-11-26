export type SerialPortConfig = {
    path: string;
    manufacturer: string;
    serialNumber: string;
    locationId: string;
    vendorId: string;
    productId: string;
};

export type OnMessageCallback = (message: string) => void;
export type OnErrorCallback = (error: Error) => void;
