const Chessino = artifacts.require("Chessino");
const CHN = artifacts.require("CHN");

const chnAddress = "";
const adminAddress = "";

module.exports = async function (deployer, network, addresses) {
  if (network == "development") {
    console.log("acc1: ", addresses[0]);
    await deployer.deploy(CHN);
    const chn = await CHN.deployed();
    for (i = 1; i < 5; i++) {
      await chn.transfer(addresses[i], "100000000000000000000");
    }
    console.log("CHN Address: ", chn.address);

    await deployer.deploy(Chessino, addresses[0], chn.address);
    const chessino = await Chessino.deployed();
    console.log("Chessino Address: ", chessino.address);
  } else {
    await deployer.deploy(CHN);
    const chn = await CHN.deployed();
    console.log("CHN Address: ", chn.address);

    await deployer.deploy(Chessino, adminAddress, chnAddress);
    const chessino = await Chessino.deployed();
    console.log("Chessino Address: ", chessino.address);
  }
};
