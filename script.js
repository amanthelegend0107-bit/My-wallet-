let wallet;

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia"
);

async function createWallet() {
  const w = ethers.Wallet.createRandom();

  const password = prompt("Set password:");
  const encrypted = await w.encrypt(password);

  localStorage.setItem("wallet", encrypted);

  alert("SAVE THIS:\n" + w.mnemonic.phrase);
}

async function loadWallet() {
  const password = prompt("Enter password:");
  const encrypted = localStorage.getItem("wallet");

  wallet = await ethers.Wallet.fromEncryptedJson(encrypted, password);
  wallet = wallet.connect(provider);

  document.getElementById("address").innerText = wallet.address;

  getBalance();
}

async function getBalance() {
  const balance = await provider.getBalance(wallet.address);

  document.getElementById("balance").innerText =
    ethers.utils.formatEther(balance) + " ETH";
}

async function send() {
  const to = document.getElementById("to").value;
  const amount = document.getElementById("amount").value;

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amount)
  });

  alert("Sent: " + tx.hash);
}
