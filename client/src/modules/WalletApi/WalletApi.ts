import timeout from '@utils/timeout';

import type { SerialPortSession } from '@modules/SerialPortSession';

const SET_SECRET_TIMEOUT = 3000;
const API_TIMEOUT = 100;
const MSG_SEND_TIMEOUT = 5;

export class WalletApi {
    private session: SerialPortSession;

    constructor(session: SerialPortSession) {
        this.session = session;
    }

    private parseResponse(command: string, response: string) {
        const regExp = new RegExp(`${command}:(.+)$`);
        const match = response.match(regExp);

        if (!match) {
            throw new Error('Invalid command response:' + response);
        }

        return match[1];
    }

    public async ping(): Promise<string> {
        const COMMAND = 'PING';

        return this.session.sendWithCallback(COMMAND)
            .then((response) => this.parseResponse(COMMAND, response));
    }

    public async getPubkey(): Promise<string> {
        const COMMAND = 'GET_PUBKEY';

        return this.session.sendWithCallback(COMMAND, API_TIMEOUT)
            .then((response) => {
                const result = this.parseResponse(COMMAND, response);

                if (result === 'FAIL') {
                    throw new Error('Failed to get pubkey');
                }

                return result;
            });
    }

    public async secretReset(): Promise<string> {
        const COMMAND = 'SECRET_RESET';

        return this.session.sendWithCallback(COMMAND, API_TIMEOUT)
            .then((response) => {
                const result = this.parseResponse(COMMAND, response);

                if (result !== 'OK') {
                    throw new Error('Failed to reset secret');
                }

                return result;
            });
    }

    public async secretSet(secret: string): Promise<string> {
        const COMMAND = 'SECRET_SET';

        await this.session.send(COMMAND);
        await timeout(MSG_SEND_TIMEOUT);

        return this.session.sendWithCallback(secret, API_TIMEOUT)
            .then(async (response) => {
                const result = this.parseResponse(COMMAND, response);

                if (result !== 'OK') {
                    throw new Error('Failed to set secret');
                }

                await timeout(SET_SECRET_TIMEOUT);
                return result;
            });
    }

    public async sign(message: string): Promise<string> {
        const COMMAND = 'SIGN';

        await this.session.send(COMMAND);
        await timeout(MSG_SEND_TIMEOUT);

        return this.session.sendWithCallback(message, API_TIMEOUT)
            .then(async (response) => {
                const result = this.parseResponse(COMMAND, response);

                if (result === 'FAIL') {
                    throw new Error('Failed to sign');
                }

                return result;
            });
    }

    public async verify(sig: string, message: string, pubkey: string): Promise<boolean> {
        const COMMAND = 'VERIFY';

        await this.session.send(COMMAND);
        await timeout(MSG_SEND_TIMEOUT);

        await this.session.send(sig);
        await timeout(MSG_SEND_TIMEOUT);

        await this.session.send(message);
        await timeout(MSG_SEND_TIMEOUT);

        return this.session.sendWithCallback(pubkey, API_TIMEOUT)
            .then(async (response) => {
                const result = this.parseResponse(COMMAND, response);

                if (result === 'FAIL') {
                    throw new Error('Failed to sign');
                }

                return result === '1';
            });
    }
}
