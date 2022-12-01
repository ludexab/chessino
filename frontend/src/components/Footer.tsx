import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-black grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 text-white pt-3 pb-3">
      {/* <Link to="/about">About</Link>
      <Link to="/contact">Contact Us</Link> */}
      <div className="text-center pl-2 pr-4">
        <p className="text-2xl font-semibold">How to play</p>
        <p className="p-5">
          Connect your wallet, stake CHN token, Create or Join a game, or Stream
          live chess game.
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold">About Us</p>
        <p className="p-5">
          We are a group of two who have come together to build a web3 chess
          game for this polygon hackathon 2022 (Beginner track). <br />
          <button onClick={() => navigate("/admin")}>Emmanuel Abalaka</button>
          (team lead, Blockchain developer), <br /> Daniel Onyedikachi
          (Blockchain developer)
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold">Terms & Conditions</p>
        <p className="p-5">
          Click <button className="text-blue-500">here</button>
        </p>
      </div>
    </div>
  );
};
