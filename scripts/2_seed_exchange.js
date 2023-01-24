const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  
  const accounts = await ethers.getSigners()

  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)

  const Raddu = await ethers.getContractAt('Token', config[chainId].RU.address)
  console.log(`Token fetched: ${Raddu.address}\n`)

  const rETH = await ethers.getContractAt('Token', config[chainId].rETH.address)
  console.log(`Token fetched: ${rETH.address}\n`)

  const rDAI = await ethers.getContractAt('Token', config[chainId].rDAI.address)
  console.log(`Token fetched: ${rDAI.address}\n`)

  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

  //give tokens to acc[1]
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)
  
  let transaction, result
  transaction = await rETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)


  transaction = await Raddu.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}`)

  transaction = await exchange.connect(user1).depositToken(Raddu.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

  transaction = await rETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}`)

  transaction = await exchange.connect(user2).depositToken(rETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} Ether from ${user2.address}\n`)

  let orderId
  transaction = await exchange.connect(user1).makeOrder(rETH.address, tokens(100), Raddu.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(rETH.address, tokens(100), Raddu.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  transaction = await exchange.makeOrder(rETH.address, tokens(50), Raddu.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(rETH.address, tokens(200), Raddu.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  await wait(1)

  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(rETH.address, tokens(10 * i), Raddu.address, tokens(10))
    result = await transaction.wait()

    console.log(`Made order from ${user1.address}`)
    await wait(1)
  }

  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(Raddu.address, tokens(10 * i), rETH.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`Made order from ${user2.address}`)
    await wait(1)
  }

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
