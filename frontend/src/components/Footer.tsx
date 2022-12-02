import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
  const [tc, setTc] = useState(false);
  const navigate = useNavigate();
  const toggleTC = () => {
    setTc(!tc);
  };
  return (
    <div className="w-full bg-black grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 text-white pt-3 pb-3">
      <div className="text-center pl-2 pr-4">
        <p className="text-2xl font-semibold text-yellow-500">
          How To Use The Platform
        </p>
        {!tc ? (
          <>
            <p className="p-5">
              Please{" "}
              <button className="text-blue-500" onClick={() => toggleTC()}>
                CLICK HERE
              </button>{" "}
              to read instructions.
            </p>
          </>
        ) : (
          <>
            <div className="p-5 flex flex-col text-black">
              <button
                className="bg-red-500 w-[100px] float-right text-white font-bold"
                onClick={() => toggleTC()}
              >
                [X] CLOSE
              </button>
              <div className="scrollable-div text-left bg-white p-5">
                <span className="font-bold">
                  How To Use The Platform: To use the Chessino gaming and
                  streaming platform, a user has to follow the following steps:
                </span>
                <br />
                <br />
                1. Login to the website at https://chessino.netlify.app/
                <br />
                <br />
                2. Connect Metamask wallet and switch to the polygon mumbai
                testnet
                <br />
                <br />
                N.B The Metamask wallet address must contain some CHN token or
                be funded with some CHN ERC20 tokens, this is your staking
                power.
                <br />
                <br />
                3. Make a stake using CHN ERC20 token deployed on Polygon Mumbai
                Testnet.
                <br />
                To create a new game or join a new game, a user will need to
                make a stake using the CHN ERC20 token from step 2 above.
                <br />
                Enter the amount of CHN you wish to stake (minimum stake is 2
                CHN) into the field in the middle left position of the screen
                and click on the stake button.
                <br />
                <br />
                4. Once the staking is successful,
                <br />
                - if the user is creating a new game, a selection dropdown will
                appear for user to select the color to play as (either playing
                as white, or playing as black). Then click on the START button,
                the game is now in waiting mode, waiting for the second player
                to begin.
                <br />
                - else if the user is joining a new game, the option to choose
                player color will not be available. The creator of the current
                game has advantage of choosing color first. Then click on the
                START button and the game commences for both players.
                <br />
                - if a new game has been created and the game is in the waiting
                mode, a user who login into the platform will automatically be
                joining the new game already created, the new game is now
                complete and game mode is now live.
                <br />
                <br />
                N.B Because this application is a prototype, only one game can
                happen at a particular time. Subsequent users that login to the
                site will automatically be streaming the current live chess
                game.
                <br />
                <br />
                5. To Stream a live chess game, remember from step 4 above that
                only one (1) game can happen at a time, once a particular chess
                game is full (i.e white and black players have commenced a game)
                any user who login onto the website will automatically be
                streaming the live game at the moment.
                <br />
                - the user does not need to stake to stream a live game, hence
                the user does not need to connect the metamask wallet to stream.
                <br />
                <br />
                6. Winning a game. Only a checkmate can result to a win in this
                gaming platform, if there is a draw, the two players are
                considered to have lost the game.
                <br />
                <br />
                7. When a player wins a game, the player is rewarded with a 90%
                of double the amount staked by that user.
              </div>
            </div>
          </>
        )}
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold text-yellow-500">About Us</p>
        <p className="p-5">
          All rights reserved <br />
          Polygon hackathon africa 2022. <br />
          <button onClick={() => navigate("/admin")}>Emmanuel Abalaka</button>
          (team lead, Blockchain developer)
          <br /> ileanwaabalaka@gmail.com
        </p>
      </div>
    </div>
  );
};
