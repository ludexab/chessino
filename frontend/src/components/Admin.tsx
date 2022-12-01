import { ChessinoContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { GiSandsOfTime } from "react-icons/gi";
import { FaLock } from "react-icons/fa";

export const Admin = () => {
  const { initContracts, account } = useContext(ChessinoContext);
  const [pendingPayout, setPendingPayout] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [payoutDone, setPayoutDone] = useState(false);
  const [peolePaid, setPeoplePaid] = useState("");
  const [winners, setWinners] = useState([[], []]);
  const [stakers, setStakers] = useState([[], []]);
  const [admin, setAdmin] = useState("");
  const [totalStakes, setTotalStakes] = useState("");

  const dashboardStyle =
    "grid grid-cols-1 dashboard-card  text-black scrollable-div pt-5 pb-5 border-yellow-500 border-[3px] pl-5";

  const DetailsCard = ({ details }: { details: string[][] }) => {
    return (
      <>
        {details[0].map((detail, i) => {
          const addr = details[0][i];
          const win = details[1][i].toString();
          const fWin = ethers.utils.formatEther(win);
          return (
            <div key={i}>
              <h6 className="p-1">
                <span className="font-bold">{i + 1}. Addr: </span>
                {addr} <span className="font-bold">Amount: </span>
                {fWin} CHN
              </h6>
              <hr />
            </div>
          );
        })}
      </>
    );
  };
  useEffect(() => {
    const initValues = async () => {
      const penPay = await getPendingPayout();
      setPendingPayout(penPay);

      const winners = await getWinnersDetails();
      setWinners(winners);
      console.log(winners);

      const stakers = await getStakersDetails();
      setStakers(stakers);
      console.log(stakers);

      const totalStakedAmount = await getTotalStakes();
      setTotalStakes(totalStakedAmount);

      const getadmin = await getChessinoAdmin();
      setAdmin(getadmin);
      console.log(admin);
      console.log(account);
    };
    initValues();
  }, [payoutDone]);

  const getPendingPayout = async () => {
    const { chessino } = initContracts();
    const pendingPayout = await chessino.getPendingPayoutAmount();
    return ethers.utils.formatEther(pendingPayout.toString()).toString();
  };
  const getWinnersDetails = async () => {
    const { chessino } = initContracts();
    const winnersDetails = await chessino.getWinnersDetails();
    return winnersDetails;
  };
  const getStakersDetails = async () => {
    const { chessino } = initContracts();
    const stakersDetails = await chessino.getStakersDetails();
    return stakersDetails;
  };
  const getTotalStakes = async () => {
    const { chessino } = initContracts();
    const totalStakes = await chessino.getTotalStakes();
    return ethers.utils.formatEther(totalStakes.toString()).toString();
  };
  const getChessinoAdmin = async () => {
    const { chessino } = initContracts();
    const admin = await chessino.getAdmin();
    return admin;
  };
  const payoutWinners = async () => {
    setPaying(true);
    const { chn, chessino } = initContracts();
    await chn.approve(chessino.address, ethers.utils.parseEther(pendingPayout));
    const payoutTxn = await chessino.payoutWinners();
    payoutTxn.wait();

    chessino.on("PayoutDone", async (totalWinners, totalPayoutAmount) => {
      console.log(totalWinners, totalPayoutAmount);
      const payingAmount = ethers.utils.formatEther(
        totalPayoutAmount.toString()
      );
      const personsPaid: string = totalWinners.toString();
      console.log(personsPaid, payingAmount);
      setPayoutAmount(payingAmount);
      setPeoplePaid(personsPaid);
      setPayoutDone(true);
      setPaying(false);
    });
  };
  return (
    <div className="flex flex-col w-full min-h-[75vh] body-div justify-center items-center">
      <div className="flex flex-col w-[40%] bg-yellow-500 h-[80px] mb-10 mt-2 rounded-lg sm:text-2xl lg:text-4xl font-bold">
        <h1 className="text-center pt-5">ADMIN DASHBOARD</h1>
      </div>

      <div className="w-[60%] p-5 pr-0  bg-white rounded-lg grid grid-cols-1">
        <div>
          <span className="float-left flex gap-1 font-bold">
            <h1 className="mt-1">Pending Payout:</h1>
            <h1 className=" text-2xl">{`${pendingPayout} CHN`}</h1>
          </span>
          <div className="grid grid-cols-4 float-right w-[200px]">
            <button
              onClick={payoutWinners}
              className="bg-yellow-500 font-bold border-[2px] border-red-500 hover:bg-yellow-300 rounded-lg p-1 col-span-3 float-right"
            >
              PAY WINNERS
            </button>
            {paying && <GiSandsOfTime className="float-right" />}
          </div>
        </div>

        {payoutDone && (
          <div className="flex justify-center text-red-500 text-xl font-semibold">
            <span>
              {`Successfully paidout ${payoutAmount} CHN to ${peolePaid} winners`}
            </span>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-1 lg:grid-cols-2 md:grid-cols-2 mt-5 p-5 gap-5 w-full text-white body-div w-full min-h-[75vh]">
        <div>
          <div className="flex justify-center w-full bg-yellow-300 text-black font-bold text-3xl">
            UNPAID WINNERS
          </div>
          <div className={dashboardStyle}>
            <div>
              <DetailsCard details={winners} />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-center w-full bg-yellow-300 text-black font-bold text-3xl">
            STAKERS
          </div>
          <div className={dashboardStyle}>
            <span className="float-left text-xl font-bold">
              Total Staked Amount: {totalStakes} CHN
            </span>
            <div>
              <DetailsCard details={stakers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
