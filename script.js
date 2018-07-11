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

(async () => {
	const $ui = document.querySelector(".miner .ui");
	const $help = document.querySelector(".miner .help");

	const $difficulty = document.querySelector("*[name='difficulty']");
	const $difficultyValue = document.querySelector(".difficulty-value");
	const $jackpot = document.querySelector(".jackpot");
	const $reward = document.querySelector(".reward");
	const $balance = document.querySelector(".balance");
	const $speed = document.querySelector(".speed");
	const $mine = document.querySelector(".mine");

	if(typeof window.web3 === "object") {
		$ui.style.display = "block";
		$help.style.display = "none";
	} else {
		return;
	}

	const web3 = window.web3 = new Web3(window.web3.currentProvider);

	/*
	if(web3.eth.coinbase === null) {
		$ui.style.display = "none";
		$help.style.display = "block";

		$help.innerHTML = `<p>Please unlock Web3.</p>`;

		return;
	}
	*/

	const promisify = f =>
		new Promise((resolve, reject) =>
			f((err, data) => err ? reject(err) : resolve(data)
	));

	if(await promisify(web3.version.getNetwork) !== "3") {
		$ui.style.display = "none";
		$help.style.display = "block";

		$help.innerHTML = `<p>Please use the Ropsten network.</p>`;

		return;
	}

	const contract = window.contract = web3.eth.contract(abi).at("0x0dd4f25228ba45aec2f55ec7b2f6c22b9fd8533f");

	const pickaxe = {};

	for(const { name } of abi) {
		pickaxe[name] = (...args) => new Promise(
			(resolve, reject) =>
				contract[name](...args, (err, data) =>
					err ? reject(err) : resolve(data)
				)
		);
	}

	const jackpot = await pickaxe.jackpot();
	const jackpotDifficulty = await pickaxe.jackpotDifficulty();
	const decimals = await pickaxe.decimals();

	const challenge = await pickaxe.challenge();
	const address = await promisify(cb => web3.eth.getCoinbase(cb));

	const balance = await pickaxe.balanceOf(address);

	const toHex = number => {
		const hex = Number(number).toString(16);

		return "0".repeat(64 - hex.length) + hex;
	};

	const formatCoins = coins => {
		coins = coins.toString(10);
		const decimalPlaces = 18;

		if(coins.length <= decimalPlaces)
			return "0." + "0".repeat(decimalPlaces - coins.length) + coins;

		return `${coins.slice(0, coins.length - decimalPlaces)}.${coins.slice(coins.length - decimalPlaces)}`;
	};


	$jackpot.innerHTML = formatCoins(jackpot);
	$balance.innerHTML = formatCoins(balance);

	let rewardDifficulty;

	$difficulty.oninput = () => {
		rewardDifficulty = +$difficulty.value;
		$difficultyValue.innerHTML = $difficulty.value;

		$reward.innerHTML = formatCoins(jackpot.mul(rewardDifficulty).div(jackpotDifficulty).floor());
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
			const startTime = Date.now();

			for(let i = 0; i < 1000; i++)
				if(hash() === true)
					return true;

			const delta = Date.now() - startTime;

			$speed.innerHTML = (1000 / delta * 1000).toFixed(2);

			return new Promise(r => setTimeout(r, 0));
		}

		$mine.disabled = true;
		while(await hashNonBlocking() !== true);
		$mine.disabled = false;

		console.log({ rewardTarget, rewardDifficulty, challenge, rewardDifficulty, address, i });
		await pickaxe.mint(i, rewardDifficulty);
	}

	$mine.onclick = async () => {
		await mine();
	};
})();
