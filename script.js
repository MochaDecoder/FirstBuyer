import axios from 'axios';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import data from './token_pair.json' assert { type: 'json' };

dotenv.config();

const buyerList = [];
const tokenList = data.eth;

async function findFirstBuyer() {
    try {
        for (let i = 0; i < tokenList.watching.length; i++) {
            let scanUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenList.watching[i].token_address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.API_KEY_ETH}`;
            const response = await axios.get(scanUrl);
            const transactions = response.data.result;

            if (transactions.length === 0) {
                console.log('No transactions found.');
                return;
            }

            for (let j = 0; j < 100; j++) {
                if (
                    transactions[j].from.toLowerCase() ===
                    tokenList.watching[i].token_pair.toLowerCase()
                ) {
                    saveBuyerList({
                        token: tokenList.watching[i].token_name,
                        from: transactions[j].to.toLowerCase(),
                    });
                }
            }
        }
        const result = findDuplicateBuyer(buyerList);
        // console.log(buyerList);
        console.log(result);
    } catch (error) {
        console.error('Error fetching transaction data:', error.message);
    }
}

function saveBuyerList(buyer) {
    const index = buyerList.findIndex(
        b => b.token === buyer.token && b.from === buyer.from
    );
    if (index === -1) {
        buyerList.push(buyer);
    }
}

function findDuplicateBuyer(buyerList) {
    const newBuyerList = buyerList.map(b => b.from);
    let sorted_arr = newBuyerList.slice().sort(); // You can define the comparing function here.

    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] === sorted_arr[i]) {
            if (results.indexOf(sorted_arr[i]) === -1)
                results.push(sorted_arr[i]);
        }
    }
    return results;
}

function getTransactionMethod(transaction) {
    try {
        if (!transaction || !transaction.input) {
            console.log('Transaction not found or input data not available.');
            return;
        }

        const inputData = transaction.input;
        const abiCoder = new ethers.utils.AbiCoder();
        const { name, signature } = abiCoder.decodeFunctionData(
            'function',
            inputData
        );

        // const methodSignature = inputData.slice(0, 10);
        // const methodName = ethers.utils.parseSignature(methodSignature);

        console.log('Method signature:', signature);
        console.log('Method name:', name);
    } catch (error) {
        console.error('Error fetching transaction data:', error.message);
    }
}

findFirstBuyer();
