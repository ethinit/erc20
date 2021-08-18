import { Contract } from 'web3-eth-contract';
import Web3 from "web3";
import { TransactionConfig } from "web3-eth";
import { AbiItem } from 'web3-utils';
export declare class Token {
    protected web3: Web3;
    readonly contract: Contract;
    protected cache: {
        [key: string]: string;
    };
    constructor(web3: Web3, address: string, abi?: AbiItem[]);
    protected _cachedCall(methodName: string, params?: string[]): Promise<string>;
    getAddress(): string;
    getName(): Promise<string>;
    getSymbol(): Promise<string>;
    getTotalSupply(): Promise<number>;
    getBalance(address: string): Promise<number>;
    getAllowance(owner: string, spender: string): Promise<number>;
    approve(spender: string, amount?: number): Promise<TransactionConfig>;
    transfer(to: string, amount: number): Promise<TransactionConfig>;
    transferFrom(from: string, to: string, amount: number): Promise<TransactionConfig>;
    utils: {
        getDecimals: () => Promise<number>;
        toDecimal: (value: string) => Promise<number>;
        fromDecimal: (value: number) => Promise<string>;
        isEqual: (token: Token) => boolean;
    };
}
