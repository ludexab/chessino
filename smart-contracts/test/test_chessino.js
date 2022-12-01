const Chessino = artifacts.require("./Chessino.sol");
const CHN = artifacts.require("./CHN.sol");

contract("CHN", (accounts) => {
  it("should deploy CHN ERC20 tokens", async () => {
    const chn = await CHN.deployed();
    const totalSuply = await chn.totalSuply();
    const name = await chn.name();
    const symbol = await chn.symbol();
    assert.equal(name, "Chessino", "name is not Chessino");
    assert.equal(symbol, "CHN", "symbol is not CHN");
    assert.equal(
      totalSuply,
      web3.utils.toWei("100000000", "ether"),
      "100 million wasn't in the contract"
    );
  });
  it("should set correct owner", async () => {
    const chn = await CHN.deployed();
    const owner = await chn.owner();
    assert.equal(
      owner,
      accounts[0],
      "account of deployer is different from owner"
    );
  });
  it("approve third party to spend tokens", async () => {
    const chn = await CHN.deployed();
    const chessino = await Chessino.deployed();
    const approve1 = await chn.approve(
      accounts[1],
      web3.utils.toWei("20", "ether"),
      { from: accounts[0] }
    );
    const approve2 = await chn.approve(
      chessino.address,
      web3.utils.toWei("9", "ether"),
      { from: accounts[0] }
    );
    const balance1 = approve1.logs[0].args.amount;
    const balance2 = approve2.logs[0].args.amount;

    assert.equal(
      balance1,
      web3.utils.toWei("20", "ether"),
      "third party was not successully approved to spend tokens"
    );
    assert.equal(
      balance2,
      web3.utils.toWei("9", "ether"),
      "Chessino was not successully approved to spend tokens"
    );
  });
});

contract("Chessino", (accounts) => {
  it("should make a stake, set winner and get pending payout", async () => {
    const chessino = await Chessino.deployed();
    const chn = await CHN.deployed();
    const approve = await chn.approve(
      chessino.address,
      web3.utils.toWei("5", "ether"),
      { from: accounts[1] }
    );
    const stake = await chessino.makeStake(web3.utils.toWei("5", "ether"), {
      from: accounts[1],
    });
    const outcome = stake.logs[0].args.amount;
    const expected = web3.utils.toWei("5", "ether");
    assert.equal(outcome, expected, "5 chn was not staked successfully");

    const setwinner = await chessino.setWinners(
      web3.utils.toWei("9", "ether"),
      {
        from: accounts[1],
      }
    );
    const expect = web3.utils.toWei("9", "ether");
    const received = setwinner.logs[0].args.amount;
    assert.equal(received, expect, "winner was not set successfully");

    const payout = await chessino.getPendingPayoutAmount();
    const xpected = web3.utils.toWei("9", "ether");
    assert.equal(payout.toString(), xpected, "pending payout not the same");
  });
  it("should get total stakes and pay winners", async () => {
    const chessino = await Chessino.deployed();
    const chn = await CHN.deployed();
    const stakes = await chessino.getTotalStakes();
    const expected = web3.utils.toWei("5", "ether");
    assert.equal(stakes.toString(), expected, "pending payout not the same");

    const appPay = await chn.approve(
      chessino.address,
      web3.utils.toWei("9", "ether"),
      { from: accounts[0] }
    );
    const pay = await chessino.payoutWinners({ from: accounts[0] });
    const res = pay.logs[0].args.totalPayoutAmount;
    console.log(pay.events);
    const xptd = web3.utils.toWei("9", "ether");
    assert.equal(res.toString(), xptd, "9 tokens were not paid to winners");
  });
});
