import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChessPage } from "./components/Chess";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CHNADDRESS,
  CHNABI,
  ChessinoAddress,
  ChessinoABI,
} from "./contract-details.json";
import { Admin } from "./components/Admin";

interface Props {
  walletConnected: boolean;
  connectWallet: React.MouseEventHandler<HTMLButtonElement>;
  account: string;
  staked: boolean;
  setStaked: React.Dispatch<React.SetStateAction<boolean>>;
  staking: boolean;
  win: boolean;
  setWin: React.Dispatch<React.SetStateAction<boolean>>;
  gameOver: Boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
  winner: string;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
  winBal: string;
  setWinBal: React.Dispatch<React.SetStateAction<string>>;
  stakeGame: React.MouseEventHandler<HTMLButtonElement>;
  chessStarted: Boolean;
  setChessStarted: React.Dispatch<React.SetStateAction<boolean>>;
  turn: string;
  setTurn: React.Dispatch<React.SetStateAction<string>>;
  playerColor: string;
  setPlayerColor: React.Dispatch<React.SetStateAction<string>>;
  fen: string;
  setFen: React.Dispatch<React.SetStateAction<string>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  gameState: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  initContracts: () => { chn: ethers.Contract; chessino: ethers.Contract };
  connecting: boolean;
}

export const ChessinoContext = React.createContext({} as Props);

const App = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [winBal, setWinBal] = useState("0");
  const [staked, setStaked] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("0");
  const [winner, setWinner] = useState("");
  const [win, setWin] = useState(false);
  const [chessStarted, setChessStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("");
  const [gameState, setGameState] = useState("");
  const [turn, setTurn] = useState(String);
  const [playerColor, setPlayerColor] = useState("null");
  const [fen, setFen] = useState(String);
  const [staking, setStaking] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectWallet: React.MouseEventHandler = async (e) => {
    e.preventDefault();
    setConnecting(true);
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setWalletConnected(true);
      let acc: Array<string> = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(acc[0]);
      setConnecting(false);
    }
  };

  const initContracts = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Initializing the smart contracts
    const chn = new ethers.Contract(CHNADDRESS, CHNABI, signer);
    const chessino = new ethers.Contract(ChessinoAddress, ChessinoABI, signer);

    return { chn, chessino };
  };

  const stakeGame: React.MouseEventHandler = async (e) => {
    e.preventDefault();

    setStaking(true);
    // Ensuring metamask wallet is installed and connected
    if (!walletConnected) {
      window.alert("Please connect wallet and try again");
      setStaking(false);
      return;
    }

    const get_amount = document.getElementById("stake") as HTMLInputElement;
    const stakeAmount = ethers.utils.parseEther(get_amount.value);

    // Layer one enforcing staking minimum amount
    if (Number(get_amount.value) < 2) {
      window.alert("Error, minimum stake amount is 2 CHN");
      setStaking(false);
      return;
    } else {
      try {
        const { chn, chessino } = initContracts();

        // Approve the Game system to stake your CHN token on your behalf
        const approveTxn = await chn.approve(
          ChessinoAddress,
          ethers.utils.parseEther(stakeAmount.toString())
        );
        approveTxn.wait();

        // Making the stake to play the game
        const stakeTxn = await chessino.makeStake(stakeAmount);
        stakeTxn.wait();

        // Listen to successful staking event
        chessino.on("StakeSuccessful", async (user, amount) => {
          const formattedAmount = ethers.utils.formatEther(amount.toString());

          // Layer two enforcing minimum staking amount
          if (Number(formattedAmount) < 2) {
            window.alert("Error, minimum stake amount is 2 CHN");
            setStaking(false);
            return;
          } else {
            setStakeAmount(formattedAmount);
            setStaked(true);
            get_amount.value = "";
            setStaking(false);
            window.alert(`You have successfully staked ${formattedAmount} CHN`);
          }
        });
        setStaking(false);
      } catch (error) {
        console.log(error);
        window.alert("failed transaction");
        setStaking(false);
        return;
      }
    }
  };

  return (
    <ChessinoContext.Provider
      value={{
        walletConnected,
        connectWallet,
        account,
        staked,
        setStaked,
        setStakeAmount,
        stakeAmount,
        winBal,
        setWinBal,
        stakeGame,
        winner,
        setWinner,
        win,
        setWin,
        chessStarted,
        setChessStarted,
        turn,
        setTurn,
        playerColor,
        setPlayerColor,
        fen,
        setFen,
        gameOver,
        setGameOver,
        result,
        setResult,
        gameState,
        setGameState,
        initContracts,
        staking,
        connecting,
      }}
    >
      <div>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<ChessPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </ChessinoContext.Provider>
  );
};

export default App;
