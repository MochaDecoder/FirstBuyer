import axios from 'axios';
import { ethers } from 'ethers';
import data from './token_pair.json' assert { type: 'json' };

const apiKey = '';

// const etherscanUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
const buyerList = ['0x35da5896a0c309a47220f8b1B13169A5bB145874'];

async function findFirstBuyer() {
    try {
        for (let i = 0; i < data.watching.length; i++) {
            let etherscanUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${data.watching[i].token}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            const response = await axios.get(etherscanUrl);
            const transactions = response.data.result;

            if (transactions.length === 0) {
                console.log('No transactions found.');
                return;
            }

            for (let j = 0; j < 20; j++) {
                if (
                    transactions[j].from.toLowerCase() ===
                    data.watching[i].token_pair.toLowerCase()
                ) {
                    console.log({
                        token: data.watching[i].token_name,
                        from: transactions[j].to,
                        value: transactions[j].value / 100000000,
                    });

                    saveBuyerList(transactions[j].to);
                }
            }
        }
        const result = findDuplicateBuyer(buyerList);
        console.log(result);

        // console.log('First buyer found:', firstTransaction.from);
    } catch (error) {
        console.error('Error fetching transaction data:', error.message);
    }
}

function saveBuyerList(buyer) {
    buyerList.push(buyer);
}

function findDuplicateBuyer(buyerList) {
    let sorted_arr = buyerList.slice().sort(); // You can define the comparing function here.
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1].toLowerCase() == sorted_arr[i].toLowerCase()) {
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
