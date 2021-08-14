import { Contract } from 'web3-eth-contract';
import Web3 from "web3";
import { TransactionConfig } from "web3-eth";
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
const erc20Abi: AbiItem[] = require('../erc20.abi.json');

export class Token {
    public readonly contract: Contract;
    protected cache: { [key: string]: string } = {};

    constructor(protected web3: Web3, address: string, abi: AbiItem[] = erc20Abi) {
        this.contract = new this.web3.eth.Contract(abi, address);
    }

    protected async _cachedCall(methodName: string): Promise<string> {
        if (typeof this.cache[methodName] === 'undefined') {
            this.cache[methodName] = await this.contract.methods[methodName]().call();
        }

        return this.cache[methodName];
    }

    getAddress(): string {
        return this.contract.options.address;
    }

    getName(): Promise<string> {
        return this._cachedCall('name');
    }

    getSymbol(): Promise<string> {
        return this._cachedCall('symbol');
    }

    getTotalSupply(): Promise<number> {
        return this.contract.methods.totalSupply().call().then(this.utils.toDecimal);
    }

    getBalance(address: string): Promise<number> {
        return this.contract.methods.balanceOf(address).call().then(this.utils.toDecimal);
    }

    getAllowance(owner: string, spender: string): Promise<number> {
        return this.contract.methods.allowance(owner, spender).call().then(this.utils.toDecimal);
    }

    async approve(spender: string, amount: number = Number.MAX_SAFE_INTEGER): Promise<TransactionConfig> {
        return {
            to: this.getAddress(),
            data: this.contract.methods.approve(spender, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }

    async transfer(to: string, amount: number): Promise<TransactionConfig> {
        return {
            to: this.getAddress(),
            data: this.contract.methods.transfer(to, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }

    async transferFrom(from: string, to: string, amount: number): Promise<TransactionConfig> {
        return {
            to: this.getAddress(),
            data: this.contract.methods.transferFrom(from, to, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }

    public utils = {
        getDecimals: async(): Promise<number> => {
            return parseInt(await this._cachedCall('decimals'));
        },

        toDecimal : async(value: string): Promise<number> => {
            let multiplier: BigNumber = new BigNumber(10).pow(await this.utils.getDecimals());
            let bnValue: BigNumber = new BigNumber(value).div(multiplier);
    
            return bnValue.lt(Number.MAX_SAFE_INTEGER) ? bnValue.toNumber() : Number.MAX_SAFE_INTEGER;
        },

        fromDecimal: async(value: number): Promise<string> => {
            let multiplier: BigNumber = new BigNumber(10).pow(await this.utils.getDecimals());
            let bnValue: BigNumber = new BigNumber(value).multipliedBy(multiplier);

            return bnValue.toFixed(0);
        }
    };
}