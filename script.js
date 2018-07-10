const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "reward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "newChallenge",
				"type": "bytes32"
			}
		],
		"name": "Mint",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "nonce",
				"type": "uint256"
			},
			{
				"name": "rewardDifficulty",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "tokens",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "tokens",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "tokenOwner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "challenge",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "jackpot",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "jackpotDifficulty",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "jackpotPeriodDuration",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

const web3 = new Web3(window.web3.currentProvider);

const contract = web3.eth.contract(abi).at("0xc141fd8ba19b30d05d799ba5c7a95479ae2bb49f");

const pickaxe = {};

const promisify = f =>
	new Promise((resolve, reject) =>
		f((err, data) => err ? reject(err) : resolve(data)
));

for(const { name } of abi) {
	pickaxe[name] = (...args) => new Promise(
		(resolve, reject) =>
			contract[name](...args, (err, data) =>
				err ? reject(err) : resolve(data)
			)
	);
}

(async () => {
	try {
		await pickaxe.jackpot();
	} catch(err) {
		alert("Please enable MetaMask!");
	}

	const jackpot = await pickaxe.jackpot();
	const jackpotDifficulty = await pickaxe.jackpotDifficulty();
	const decimals = await pickaxe.decimals();

	const challenge = await pickaxe.challenge();
	const address = await promisify(cb => web3.eth.getCoinbase(cb));

	const balance = await pickaxe.balanceOf(address);

	console.log(balance.toString());

	const toHex = number => {
		const hex = Number(number).toString(16);

		return "0".repeat(64 - hex.length) + hex;
	};

	const formatCoins = coins => {
		console.log(coins);
		coins = coins.toString();
		const decimalPlaces = 18;

		if(coins.length <= decimalPlaces)
			return "0." + "0".repeat(decimalPlaces - coins.length) + coins;

		return coins.slice(0, coins.length - decimalPlaces) + "." + coins.slice(coins.length - decimalPlaces);
	};

	const $difficulty = document.querySelector("*[name='difficulty']");
	const $difficultyValue = document.querySelector(".difficulty-value");
	const $jackpot = document.querySelector(".jackpot");
	const $reward = document.querySelector(".reward");
	const $balance = document.querySelector(".balance");
	const $mine = document.querySelector(".mine");

	$jackpot.innerHTML = formatCoins(jackpot);
	$balance.innerHTML = formatCoins(balance);

	let rewardDifficulty;

	$difficulty.oninput = () => {
		rewardDifficulty = +$difficulty.value;
		$difficultyValue.innerHTML = $difficulty.value;

		$reward.innerHTML = formatCoins(Math.floor(jackpot * rewardDifficulty / jackpotDifficulty));
	};

	$difficulty.oninput();

	async function mine() {
		const rewardTarget = (new web3.BigNumber(2)).pow(256).div(new web3.BigNumber(rewardDifficulty));

		const header = challenge.slice(2) + toHex(rewardDifficulty) + address.slice(2);

		let i = -1;

		function hash() {
			const input = header + toHex(++i);

			const output = new web3.BigNumber(web3.sha3(input, {
				encoding: "hex"
			}).slice(2), 16);

			return rewardTarget.greaterThan(output) === true;
		}

		async function hashNonBlocking() {
			for(let i = 0; i < 100; i++)
				if(hash() === true)
					return true;

			return new Promise(r => setTimeout(r, 0));
		}

		while(await hashNonBlocking() !== true);
		console.log({ rewardTarget, rewardDifficulty, challenge, rewardDifficulty, address, i });
		await pickaxe.mint(i, rewardDifficulty);
	}

	$mine.onclick = () => {
		mine();
		$mine.disabled = true;
	};
})();
