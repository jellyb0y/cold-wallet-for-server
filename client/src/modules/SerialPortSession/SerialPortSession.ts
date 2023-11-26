import { SerialPort } from 'serialport';

import timeout from '@utils/timeout';

import type { OnErrorCallback, OnMessageCallback } from '@types';

const INIT_TIMEOUT = 1500;

export class SerialPortSession {
    public isSerialInitiated: Promise<void>;
    public isSerialReady: Promise<void>;

    private onMessageCallback: Set<OnMessageCallback>;
    private onErrorCallback: Set<OnErrorCallback>;
    private onCloseCallback: Set<OnErrorCallback>;

    private serialPort: SerialPort;

    constructor() {
        this.onMessageCallback = new Set();
        this.onErrorCallback = new Set();
        this.onCloseCallback = new Set();

        this.isSerialInitiated = this.seriaPortInit();
        this.isSerialReady = this.bindCallback();
    }

    private async seriaPortInit() {
        const list = await SerialPort.list();
        const config = list.find(({ vendorId }) => vendorId === 'f055');

        if (!config) {
            console.log('Failed to find serial port');
            return;
        }

        this.serialPort = new SerialPort({
            path: config.path,
            baudRate: 115200,
        });
    }

    private async bindCallback() {
        await this.isSerialInitiated;

        this.serialPort.on('data', (stdout: Buffer) => {
            this.onMessageCallback.forEach((callback) => {
                callback(stdout.toString().replace(/\r|\n/g, ''));
            });
        });

        this.serialPort.on('close', (error: Error) => {
            console.log('Serial port closed', error);
            this.onCloseCallback.forEach((callback) => {
                callback(error);
            });
        });

        return new Promise<void>((resolve, reject) => {
            this.serialPort.on('error', (error: Error) => {
                console.log('Error while opening serial port :', error);
                this.onErrorCallback.forEach((callback) => {
                    callback(error);
                });

                reject(error);
            });

            this.serialPort.on('open', async () => {
                console.log('Serial port opened', this.serialPort.path);

                await timeout(INIT_TIMEOUT);
                resolve();
            });
        });
    }

    public onMessage(callback: OnMessageCallback) {
        this.onMessageCallback.add(callback);

        return () => {
            this.onMessageCallback.delete(callback);
        };
    }

    public onError(callback: OnErrorCallback) {
        this.onCloseCallback.add(callback);

        return () => {
            this.onCloseCallback.delete(callback);
        };
    }

    public onClose(callback: OnErrorCallback) {
        this.onCloseCallback.add(callback);

        return () => {
            this.onCloseCallback.delete(callback);
        };
    }

    public async send(message: string): Promise<void> {
        await this.isSerialReady;

        const buf = Buffer.from(message + '\r\n');

        return new Promise((resolve, reject) => {
            this.serialPort.write(buf, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public async sendWithCallback(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.onMessage(resolve);
            this.send(message).catch(reject);
        });
    }
}
