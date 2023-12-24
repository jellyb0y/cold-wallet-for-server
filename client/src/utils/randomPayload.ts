const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export const randomPayload = (length: number) => {
  let payload = '';

  for (let i = 0; i < length; i += 1) {
    const charIndex = Math.floor(Math.random() * ALPHABET.length);
    const char = ALPHABET.charAt(charIndex);
    payload += char;
  }

  return payload;
};
