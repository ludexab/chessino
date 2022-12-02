const Chessino = artifacts.require("Chessino");
const CHN = artifacts.require("CHN");

module.exports = async function (deployer, network, addresses) {
  if (network == "development") {
    await deployer.deploy(CHN);
    const chn = await CHN.deployed();
    for (i = 1; i < 5; i++) {
      await chn.transfer(addresses[i], "100000000000000000000");
    }
    console.log("CHN Address: ", chn.address);

    await deployer.deploy(Chessino, chn.address);
    const chessino = await Chessino.deployed();
    console.log("Chessino Address: ", chessino.address);
  } else {
    await deployer.deploy(CHN);
    const chn = await CHN.deployed();
    await chn.transfer(
      "0xf40072D5D56dd8C6964a11a23D0186c2b64491DF",
      "100000000000000000000"
    );
    console.log("CHN Address: ", chn.address);

    await deployer.deploy(Chessino, chn.address);
    const chessino = await Chessino.deployed();
    console.log("Chessino Address: ", chessino.address);
  }
};
