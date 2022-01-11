import preset from '../src/index';
import * as babel from '@babel/core';
import babelPresetEnv from '@babel/preset-env';

function start() {
    test.each(inputs.map((input) => [input.name, input] as const))(`%s`, async (_, input) => {
        const babelOutput = await babel.transformAsync(input.source, {
            presets: [
                [babelPresetEnv, { modules: false }],
                [preset, input.presetOptions],
            ],
        });

        expect(babelOutput!.code).toMatchSnapshot();
    });
}

const inputs: Array<{
    name: string,
    presetOptions: preset.Options,
    source: string,
}> = [
    {
        name: 'allowDeclareFields',
        presetOptions: {
            allowDeclareFields: true,
        },
        source: `
        class A {
            declare foo: string; // Removed
            bar: string; // Initialized to undefined
            prop?: string; // Initialized to undefined
            prop1!: string // Initialized to undefined
        }
        `,
    },
    {
        name: 'onlyRemoveTypeImports: true',
        presetOptions: {
            onlyRemoveTypeImports: true,
        },
        source: `
        import { A } from 'a';
        import { B } from 'b';
        console.log(B);
        import type { C } from 'c';
        `,
    },
    {
        name: 'onlyRemoveTypeImports: false',
        presetOptions: {
            onlyRemoveTypeImports: false,
        },
        source: `
        import { A } from 'a';
        import { B } from 'b';
        console.log(B);
        import type { C } from 'c';
        `,
    },
    {
        name: 'TypeScript const enum',
        presetOptions: {},
        source: `
        const enum MyEnum {
            A = 1,
            B = A,
            C,
            D = C,
            E = 1,
            F,
            G = A * E,
            H = A ** B ** C,
            I = A << 20
        }
        `,
    }
];

start();
