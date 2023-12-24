import { SerialPortSession } from '@modules/SerialPortSession';
import { WalletApi } from '@modules/WalletApi';

import input from '@utils/input';
import { randomPayload } from '@utils/randomPayload';

(async () => {
    const serialSession = new SerialPortSession();
    const walletApi = new WalletApi(serialSession);

    serialSession.onClose(() => process.exit());

    await walletApi.ping();
    console.log('\n-----\nWallet is Ready\n-----\n');

    const mainPrompt =
        '\n-----\n' +
        'Select operation:\n' +
        '(1) Get public key\n' +
        '(2) Sign message\n' +
        '(3) Verify signature\n' +
        '(4) Set secret key\n' +
        '(5) Reset secret to random key\n' +
        '...\n' +
        '(6) Benchmark\n' +
        '...\n' +
        '(x) Close\n'+
        '----\n\n' +
        'Operation:';

    while (true) {
        const operation = await input(mainPrompt);

        switch(operation.toLowerCase()) {
            case '1': {
                await walletApi.getPubkey()
                    .then((pubkey) => console.log('Public key:', pubkey))
                    .catch(() => console.log('Oops! Failed to get public key.'));

                break;
            };

            case '2': {
                const message = await input('Message to sign:');
                await walletApi.sign(message)
                    .then((sig) => console.log('Signature:', sig))
                    .catch(() => console.log('Oops! Failed to make signature.'));

                break;
            };

            case '3': {
                const sig = await input('Signature:');
                const message = await input('Message:');
                const pubkey = await input('Pubkey:');
                console.log('Verifying...');

                await walletApi.verify(sig, message, pubkey)
                    .then((result) => {
                        if (result) {
                            console.log('Signature is valid!');
                        } else {
                            console.log('Signature is NOT valid!');
                        }
                    })
                    .catch(() => console.log('Oops! Failed to verify signature.'));

                break;
            };

            case '4': {
                const secret = await input('New secret key:');
                await walletApi.secretSet(secret)
                    .then(() => console.log('Secret key is set up!'))
                    .catch(() => console.log('Oops! Failed to set key up'));

                break;
            };

            case '5': {
                await walletApi.secretReset()
                    .then(() => console.log('A new secret key is generated!'))
                    .catch(() => console.log('Oops! Failed to generate new secret key'));

                break;
            };

            case '6': {
                const complexity = parseInt(await input('Type test complexity (number):'), 10);

                if (!complexity || isNaN(complexity)) {
                    console.log('Wrong complexity number');
                    break;
                }

                const testsCount = parseInt(await input('Type tests count (number):'), 0);

                if (!testsCount || isNaN(testsCount)) {
                    console.log('Wrong tests count number');
                    break;
                }

                const payload = randomPayload(complexity);
                const testTimes: number[] = [];

                try {
                    for (let i = 0; i < testsCount; i += 1) {
                        const startTs = Date.now();
                        await walletApi.sign(payload);
                        const testTime = Date.now() - startTs;
                        testTimes.push(testTime);

                        if ((i + 1) % 10 === 0) {
                            console.log(`Bench test ${i + 1}/${testsCount}`);
                        }
                    }
                } catch(e) {
                    console.error('Error occurred!', e);
                    break;
                }

                const maxTestTime = Math.max(...testTimes);
                const minTestTime = Math.min(...testTimes);
                
                const testTimeSum = testTimes.reduce((acc, time) => acc + time, 0);
                const avgTestTime = Math.floor(testTimeSum / testsCount) / 1000;

                console.log(
                    `Bench test ended successfuly!\n` +
                    `Average sign time: ${avgTestTime}s\n` +
                    `Max time: ${maxTestTime / 1000}s\n` +
                    `Min time: ${minTestTime / 1000}s\n`
                );

                break;
            };

            case 'x': {
                console.log('See you! Bye!');
                process.exit();
            };

            default:
                console.log('Invalid operation\n');
        }
    }
})();
