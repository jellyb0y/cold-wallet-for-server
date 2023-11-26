import { SerialPortSession } from '@modules/SerialPortSession';
import { WalletApi } from '@modules/WalletApi';
import input from '@utils/input';

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

            case 'x': {
                console.log('See you! Bye!');
                process.exit();
            };

            default:
                console.log('Invalid operation\n');
        }
    }
})();
