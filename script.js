let wallet;
let lastBalance = 0;

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia"
);

// ===== CREATE WALLET =====
async function createWallet() {
  const w = ethers.Wallet.createRandom();

  const password = prompt("Set password:");
  const encrypted = await w.encrypt(password);

  localStorage.setItem("wallet", encrypted);

  alert("SAVE THIS SEED:\n" + w.mnemonic.phrase);
}

// ===== LOAD WALLET =====
async function loadWallet() {
  const password = prompt("Enter password:");
  const encrypted = localStorage.getItem("wallet");

  wallet = await ethers.Wallet.fromEncryptedJson(encrypted, password);
  wallet = wallet.connect(provider);

  document.getElementById("address").innerText = wallet.address;

  getBalance();
  trackWallet();
}

// ===== GET BALANCE =====
async function getBalance() {
  const balance = await provider.getBalance(wallet.address);
  const eth = parseFloat(ethers.utils.formatEther(balance));

  const price = await getPrice();
  const usd = eth * price;

  document.getElementById("balance").innerText =
    eth.toFixed(4) + " ETH ($" + usd.toFixed(2) + ")";
}

// ===== SEND =====
async function send() {
  const to = document.getElementById("to").value;
  const amount = document.getElementById("amount").value;

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amount)
  });

  notify("📤 Sending $" + amount);

  await tx.wait();

  notify("✅ Transaction confirmed");
}

// ===== TRACK WALLET (NOTIFICATIONS) =====
async function trackWallet() {
  setInterval(async () => {
    const balance = await provider.getBalance(wallet.address);
    const current = parseFloat(ethers.utils.formatEther(balance));

    if (lastBalance !== 0) {
      const price = await getPrice();

      if (current > lastBalance) {
        const diff = (current - lastBalance) * price;
        notify("💰 Received $" + diff.toFixed(2));
      }

      if (current < lastBalance) {
        const diff = (lastBalance - current) * price;
        notify("📤 Sent $" + diff.toFixed(2));
      }
    }

    lastBalance = current;
    getBalance();

  }, 4000);
}

// ===== NOTIFICATION SYSTEM =====
function notify(msg) {
  if (Notification.permission === "granted") {
    new Notification(msg);
  } else {
    alert(msg);
  }
}

// Ask permission
Notification.requestPermission();

// ===== GET ETH PRICE =====
async function getPrice() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  const data = await res.json();
  return data.ethereum.usd;
}
