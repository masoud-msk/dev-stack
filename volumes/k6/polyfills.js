import { crypto } from 'k6/experimental/webcrypto';

Object.assign(globalThis, { crypto });
