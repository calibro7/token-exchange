async function main() {
  console.log(`Preparing deployment...\n`)

  const Token = await ethers.getContractFactory('Token');
  const Exchange = await ethers.getContractFactory('Exchange');

  const accounts = await ethers.getSigners()

  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  const raddu = await Token.deploy('Raddu', 'RU', '1000000')
  await raddu.deployed()
  console.log(`Raddu Deployed to: ${raddu.address}`)

  const rETH = await Token.deploy('rETH', 'rETH', '1000000')
  await rETH.deployed()
  console.log(`rETH Deployed to: ${rETH.address}`)

  const rDAI = await Token.deploy('rDAI', 'rDAI', '1000000')
  await rDAI.deployed()
  console.log(`rDAI Deployed to: ${rDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
