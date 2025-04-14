import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./abi/crowdfunding";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [goal, setGoal] = useState("0");
  const [donated, setDonated] = useState("0");
  const [balance, setBalance] = useState("0");
  const [timeLeft, setTimeLeft] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const crowdfunding = new ethers.Contract(contractAddress, contractABI, signer);

      setWallet(address);
      setContract(crowdfunding);
    }
  };

  const loadData = async () => {
    if (!contract || !wallet) return;

    const _goal = await contract.goal();
    const _donated = await contract.totalDonated();
    const _balance = await contract.getBalance();
    const _time = await contract.getTimeLeft();
    const _owner = await contract.owner();

    setGoal(ethers.formatEther(_goal));
    setDonated(ethers.formatEther(_donated));
    setBalance(ethers.formatEther(_balance));
    setTimeLeft(_time.toString());
    setIsOwner(wallet.toLowerCase() === _owner.toLowerCase());
  };

  const donate = async () => {
    if (!contract || !donationAmount) return;
    const tx = await contract.donate({
      value: ethers.parseEther(donationAmount)
    });
    await tx.wait();
    setDonationAmount("");
    loadData();
  };

  const withdraw = async () => {
    if (!contract) return;
    const tx = await contract.withdraw();
    await tx.wait();
    loadData();
  };

  const refund = async () => {
    if (!contract) return;
    const tx = await contract.refund();
    await tx.wait();
    loadData();
  };

  useEffect(() => {
    if (contract && wallet) {
      loadData();
    }
  }, [contract, wallet]);

  return (
    <div className="App">
      <h1>🚀 Crowdfunding DApp</h1>

      {!wallet ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <>
          <p><strong>Wallet:</strong> {wallet}</p>
          <p><strong>Goal:</strong> {goal} ETH</p>
          <p><strong>Donated:</strong> {donated} ETH</p>
          <p><strong>Contract Balance:</strong> {balance} ETH</p>
          <p><strong>Time left:</strong> {timeLeft} sec</p>

          <input
            type="text"
            placeholder="Amount in ETH"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
          />
          <button onClick={donate}>💸 Donate</button>

          <br /><br />
          {isOwner && <button onClick={withdraw}>💰 Withdraw</button>}
          {!isOwner && <button onClick={refund}>↩️ Request Refund</button>}
        </>
      )}
    </div>
  );
}

export default App;
