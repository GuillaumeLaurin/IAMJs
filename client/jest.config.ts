import { Config } from '@jest/types';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const config: Config.InitialOptions = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
    },
};

export default createJestConfig(config);