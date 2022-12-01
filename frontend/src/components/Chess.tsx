import { useEffect, useContext, useState } from "react";
import ChessBoardImage from "./images/chessboard.png";
import { Chess, Square } from "chess.js";
import ChessBoard from "chessboardjsx";
import { GiSandsOfTime } from "react-icons/gi";
import { ChessinoContext } from "../App";
import { gameDocRef } from "./firebase";
import { onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { shortAddress } from "../utils/shortAddr";
import { ethers } from "ethers";

const chess = new Chess();
let capturedWhitePieces: string[] = [];
let capturedBlackPieces: string[] = [];

export const ChessPage = () => {
  const {
    walletConnected,
    connectWallet,
    staked,
    account,
    stakeGame,
    stakeAmount,
    chessStarted,
    setChessStarted,
    playerColor,
    setPlayerColor,
    fen,
    setFen,
    winner,
    setWin,
    setWinner,
    setStakeAmount,
    setStaked,
    gameOver,
    setGameOver,
    result,
    setResult,
    win,
    gameState,
    setGameState,
    initContracts,
    staking,
    connecting,
  } = useContext(ChessinoContext);

  const [claimingWin, setClaimingWin] = useState(false);
  const [startingChess, setStartingChess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [player, setPlayer] = useState(false);
  const [gameFull, setGameFull] = useState(false);
  const [gameEmpty, setGameEmpty] = useState(Boolean);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      const color: string = (await getDoc(gameDocRef)).data()?.color;
      const members: string = (await getDoc(gameDocRef)).data()?.members;
      const newFen: string = (await getDoc(gameDocRef)).data()?.fen;
      const isGameStarted: string = (await getDoc(gameDocRef)).data()
        ?.gameStarted;
      console.log(color, members, isGameStarted);

      if (members == "2") {
        // Game is full and user can only watch live game
        setFen(newFen);
        setPlayerColor("white");
        setGameFull(true);
        if (isGameStarted == "yes") {
          setGameStarted(true);
        }
        setChessStarted(true);
      } else {
        // Game is not full
        if (members == "0") {
          // Game is empty and user can user can create a new game
          setGameEmpty(true);
        } else if (members == "1") {
          // Game requires 1 more to complete and user can join the new game
          setGameEmpty(false);
          if (color == "white") {
            setPlayerColor("black");
          } else if (color == "black") {
            setPlayerColor("white");
          }
        }
      }
    };
    initGame();
  }, []);

  const handlePlay = async () => {
    setStartingChess(true);
    if (gameEmpty) {
      let playAs = document.getElementById("play-as") as HTMLSelectElement;
      setPlayerColor(playAs.value);
      // Set members to 1
      await updateDoc(gameDocRef, {
        fen: "start",
        members: "1",
        color: playAs.value,
      });
      setPlayer(true);
      setGameEmpty(false);
      console.log("playing as: ", playerColor);
    }
    if (!gameEmpty) {
      const curColor: string = (await getDoc(gameDocRef)).data()?.color;
      if (curColor == "white") {
        setPlayerColor("black");
      } else if (curColor == "black") {
        setPlayerColor("white");
      }
      await updateDoc(gameDocRef, {
        members: "2",
        gameStarted: "yes",
        gameState: "live",
      });
      setGameStarted(true);
      console.log("playing as: ", playerColor);
    }
    setPlayer(true);
    setChessStarted(!chessStarted);
    setStaked(false);
    setStartingChess(false);
  };

  const onDrop = async ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => {
    let curResult = "";
    let pendingUpdate = {};
    let move = chess.move({
      from: sourceSquare,
      to: targetSquare,
    });
    if (move === null) {
      return;
    }

    // Ensuring a player can only move his own piece
    if (player && gameStarted && playerColor[0] === move.color) {
      if (move.captured) {
        if (move.color == "w") {
          capturedBlackPieces.push(move.captured.toUpperCase());
        } else {
          capturedWhitePieces.push(move.captured.toUpperCase());
        }
      }
      // Checking for game state
      if (chess.game_over()) {
        if (chess?.in_draw()) {
          curResult = "DRAW";
        } else if (chess?.in_checkmate()) {
          curResult = "CHECKMATE";
          if (move?.color == "w") {
            setWinner("white");
          } else {
            setWinner("black");
          }
        } else if (chess?.in_stalemate()) {
          curResult = "STALEMATE";
        } else if (chess?.in_threefold_repetition()) {
          curResult = "3-FOLD REPETITION";
        }
        pendingUpdate = {
          color: "",
          fen: "start",
          finalFen: chess.fen(),
          gameResult: curResult,
          gameStarted: "no",
          gameState: "gameOver",
          members: "0",
        };
        subscription();
      }

      if (!chess.game_over()) {
        pendingUpdate = { fen: chess?.fen(), gameState: "live" };
      }
      setFen(chess.fen());
      chess.load(chess.fen());
      await updateDoc(gameDocRef, pendingUpdate);
    } else {
      chess.undo();
    }
  };

  const subscription = onSnapshot(gameDocRef, async (snapshot) => {
    const newGameState = snapshot.data()!.gameState;
    const newGameResult = snapshot.data()!.gameResult;
    const isGameStarted = snapshot.data()!.gameStarted;
    if (newGameState == "gameOver") {
      const finalFen = snapshot.data()!.finalFen;
      setFen(finalFen);
      chess.load(finalFen);
      setResult(newGameResult);
      if (newGameResult == "CHECKMATE") {
        setWin(true);
      }
      setGameState(newGameState);
      setGameOver(true);
      setGameStarted(false);
      subscription();
    } else {
      if (isGameStarted == "yes") {
        setGameStarted(true);
      }
      const newFen = snapshot.data()!.fen;
      setFen(newFen);
      chess.load(newFen);
    }
  });

  const redeemWin = async () => {
    setClaimingWin(true);
    const getStakeAmount = Number(stakeAmount);
    const amountWon = getStakeAmount * 2 * 0.9;
    const pAmountWon = ethers.utils.parseEther(amountWon.toString());
    console.log("amount won: ", amountWon);
    console.log("pAWon: ", pAmountWon.toString());
    const winAmount = pAmountWon;
    await resetChess();
    const { chessino } = initContracts();
    chessino.setWinners(winAmount.toString());
    setClaimingWin(false);
    window.alert("Congratulations! You just won the game!!");
  };

  const resetChess = async () => {
    chess.clear();
    chess.reset();
    setWin(false);
    setStakeAmount("0");
    setStaked(false);
    setChessStarted(false);
    setGameOver(false);
    setGameFull(false);
    await updateDoc(gameDocRef, {
      fen: "start",
      finalFen: "",
      color: "",
      gameResult: "",
      gameStarted: "no",
      gameState: "waiting",
      members: "0",
    });
  };

  const playAgain = async () => {
    setResetting(true);
    await resetChess();
    setResetting(false);
  };

  const stopWatching = async () => {
    setChessStarted(false);
    setFen("start");
    setPlayerColor("null");
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-5 w-full text-black body-div">
      <div className="grid grid-cols-1 items-center side-div pt-5 pb-5">
        <div className="justify-center justify-content-center items-center text-center flex flex-col">
          {walletConnected ? (
            <>
              <h1 className="font-bold text-2xl text-black">Wallet Address</h1>
              <button
                disabled={true}
                className="bg-yellow-500 rounded-lg p-2 font-semibold border-[3px]"
              >
                {shortAddress(account)}
              </button>
            </>
          ) : (
            <div className="flex">
              <button
                className="bg-yellow-500 rounded-md p-2 font-semibold border-[0.5px] hover:border-black hover:bg-yellow-300"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
              {connecting && <GiSandsOfTime className="float-right" />}
            </div>
          )}
        </div>

        <div className="justify-center justify-content-center items-center text-center flex flex-col">
          <h3 className="text-center text-black font-bold sm:text-2xl pt-1 pb-3 p-2">
            Please make a stake to play
          </h3>
          <form>
            <input
              id="stake"
              type="number"
              placeholder="CHN"
              className="pl-2 pr-2 rounded-md bg-white"
            />
            <button
              disabled={chessStarted ? true : false}
              className={`${
                chessStarted
                  ? "bg-gray-500"
                  : "bg-yellow-500 hover:border-black hover:bg-yellow-300"
              } border-[0.5px] rounded-lg ml-2 p-2 mb-5 font-semibold hover:border-[1px]`}
              onClick={stakeGame}
            >
              Stake
            </button>
            {staking && <GiSandsOfTime className="float-right" />}
          </form>
        </div>
        {staked && (
          <div className="flex gap-3 justify-center justify-content-center items-center text-center flex">
            {gameEmpty && (
              <>
                <label className="text-black font-bold">Player color:</label>
                <select
                  name="plas-as"
                  id="play-as"
                  className="text-black rounded-md"
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </>
            )}

            <button
              disabled={chessStarted ? true : false}
              className="bg-green-500 rounded-lg p-2 font-bold text-white text-2xl"
              onClick={handlePlay}
            >
              START
            </button>
            {startingChess && <GiSandsOfTime className="float-right" />}
          </div>
        )}
      </div>
      <div className="col-span-2 main-div items-center pb-3 pt-5">
        {chessStarted ? (
          <>
            <div className="flex flex-col items-center mb-3">
              <div className="flex flex-col items-center mb-3">
                {chess && gameOver && (
                  <div className="flex flex-col items-center mb-3 mr-3">
                    <h1 className="font-bold">Game Over, {result}</h1>
                    {player && win && playerColor == winner && (
                      <>
                        <div className="flex flex-col items-center mb-3">
                          <h1 className="font-bold">
                            Congratulations, you won!
                          </h1>
                          <button
                            onClick={redeemWin}
                            className="bg-yellow-500 border-[1px] hover:border-black hover:bg-yellow-300 font-bold mt-3 w-32 rounded-lg ml-3"
                          >
                            Claim Reward
                          </button>
                          {claimingWin && (
                            <GiSandsOfTime className="float-right" />
                          )}
                        </div>
                      </>
                    )}
                    {player && win && playerColor != winner && (
                      <>
                        <div className="flex flex-col items-center mb-3">
                          <h1 className="font-bold">You lost, try again!</h1>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-3">
                {gameStarted ? (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={true}
                      className="w-[20px] h-[20px] rounded-full bg-green-500"
                    />
                    <h1>LIVE</h1>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-black font-semibold">
                    <button
                      disabled={true}
                      className="w-[20px] h-[20px] rounded-full bg-red-500"
                    />
                    <h1>Waiting...</h1>
                  </div>
                )}
              </div>
              <div className="flex w-full justify-center mb-5">
                <ChessBoard
                  width={360}
                  orientation={playerColor === "black" ? "black" : "white"}
                  position={fen}
                  onDrop={onDrop}
                />
              </div>
              {player && (
                <>
                  {playerColor == "black" ? (
                    <div>
                      <h1>capturedWhitePieces:</h1>
                      <p className="flex justify-center text-black font-bold">
                        {capturedBlackPieces}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h1>capturedBlackPieces:</h1>
                      <p className="flex justify-center text-black font-bold">
                        {capturedBlackPieces}
                      </p>
                    </div>
                  )}
                </>
              )}

              {gameOver ? (
                <>
                  {player ? (
                    <>
                      {playerColor != winner && (
                        <div className="flex justify-center items-center">
                          <button
                            className="bg-green-500 border-[1px] hover:border-black rounded-lg p-2 text-white font-bold mr-3"
                            onClick={playAgain}
                          >
                            <h1>REPLAY</h1>
                          </button>
                          {resetting && (
                            <GiSandsOfTime className="float-right" />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center items-center">
                        <button
                          className="bg-red-500 border-[1px] hover:border-black rounded-lg p-2 text-white font-bold mr-3"
                          onClick={stopWatching}
                        >
                          <h1>LEAVE</h1>
                        </button>
                        {resetting && <GiSandsOfTime className="float-right" />}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {player ? (
                    <>
                      <div className="flex justify-center items-center">
                        <button
                          className="bg-red-500 rounded-lg p-2 text-white font-bold mr-3"
                          onClick={playAgain}
                        >
                          <h1>QUIT</h1>
                        </button>
                        {resetting && <GiSandsOfTime className="float-right" />}
                        <button
                          disabled
                          className="border-[1px] border-black bg-yellow-500 rounded-lg p-2 text-black font-bold"
                        >
                          Stake: ${stakeAmount}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center items-center">
                        <button
                          className="bg-red-500 rounded-lg p-2 text-white font-bold mr-3 hover:bg-red-400"
                          onClick={stopWatching}
                        >
                          <h1>STOP WATCHING</h1>
                        </button>
                        {resetting && <GiSandsOfTime className="float-right" />}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-3">
              <div className="justify-center justify-content-center items-center p-5 text-center flex flex-col">
                <h1 className="text-black mb-5 text-2xl font-bold">
                  Please connect wallet, make a stake, play and win!
                </h1>
              </div>
              <img
                src={ChessBoardImage}
                className="w-96 h-96 "
                alt="chessboard image"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
