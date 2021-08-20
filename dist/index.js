"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const bignumber_js_1 = require("bignumber.js");
const erc20Abi = require('../erc20.abi.json');
class Token {
    constructor(web3, address, abi = erc20Abi) {
        this.web3 = web3;
        this.cache = {};
        this.utils = {
            getDecimals: async () => {
                return parseInt(await this._cachedCall('decimals'));
            },
            toDecimal: async (value) => {
                let multiplier = new bignumber_js_1.default(10).pow(await this.utils.getDecimals());
                let bnValue = new bignumber_js_1.default(value).div(multiplier);
                return bnValue.lt(Number.MAX_SAFE_INTEGER) ? bnValue.toNumber() : Number.MAX_SAFE_INTEGER;
            },
            fromDecimal: async (value) => {
                let multiplier = new bignumber_js_1.default(10).pow(await this.utils.getDecimals());
                let bnValue = new bignumber_js_1.default(value).multipliedBy(multiplier);
                return bnValue.toFixed(0);
            },
            isEqual: (token) => {
                return this.getAddress().toLocaleLowerCase() == token.getAddress().toLocaleLowerCase();
            }
        };
        this.contract = new this.web3.eth.Contract(abi, address);
    }
    static getInstance(web3, address, abi) {
        if (!web3['ethinit']) {
            web3['ethinit'] = {};
        }
        if (!web3['ethinit']['erc20']) {
            web3['ethinit']['erc20'] = {};
        }
        address = address.toLowerCase();
        if (!web3['ethinit']['erc20'][address]) {
            web3['ethinit']['erc20'][address] = new Token(web3, address, abi);
        }
        return web3['ethinit']['erc20'][address];
    }
    async _cachedCall(methodName, params = []) {
        let cacheKey = methodName + params.join(';');
        if (typeof this.cache[cacheKey] === 'undefined') {
            this.cache[cacheKey] = this.contract.methods[methodName].apply(null, params).call();
        }
        return this.cache[cacheKey];
    }
    getAddress() {
        return this.contract.options.address;
    }
    getName() {
        return this._cachedCall('name');
    }
    getSymbol() {
        return this._cachedCall('symbol');
    }
    getTotalSupply() {
        return this.contract.methods.totalSupply().call().then(this.utils.toDecimal);
    }
    getBalance(address) {
        return this.contract.methods.balanceOf(address).call().then(this.utils.toDecimal);
    }
    getAllowance(owner, spender) {
        return this.contract.methods.allowance(owner, spender).call().then(this.utils.toDecimal);
    }
    async approve(spender, amount = Number.MAX_SAFE_INTEGER) {
        return {
            to: this.getAddress(),
            data: this.contract.methods.approve(spender, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }
    async transfer(to, amount) {
        return {
            to: this.getAddress(),
            data: this.contract.methods.transfer(to, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }
    async transferFrom(from, to, amount) {
        return {
            to: this.getAddress(),
            data: this.contract.methods.transferFrom(from, to, await this.utils.fromDecimal(amount)).encodeABI(),
            gas: 150000
        };
    }
}
exports.Token = Token;
