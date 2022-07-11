const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../help-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let mockV3Aggregator
          let deployer
          const sendValue = ethers.utils.parseEther("1") //1ETH
          beforeEach(async function () {
              //const accounts = await ethers.getSigners()
              //const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("consturctor", async function () {
              it("Sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structrue", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("Withdraw ETH from a signle funder", async function () {
                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Allows us to withdraw with mutiple funders", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //console.log(`startFundMeBalance:${startFundMeBalance}`)
                  //console.log(`startDeployerBalance:${startDeployerBalance}`)

                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //console.log(`endFundMeBalance:${endFundMeBalance}`)
                  //console.log(`endDeployerBalance:${endDeployerBalance}`)

                  //assert
                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endDeployerBalance.add(gasCost).toString()
                  )

                  //Make sure that the funders are reset properly
                  //await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 0; i < 6; i++) {
                      await expect(fundMe.getFunder(i)).to.be.reverted
                  }

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })

          describe("cheaperWithdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("cheaperWithdraw ETH from a signle funder", async function () {
                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Allows us to cheaperWithdraw with mutiple funders", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //console.log(`startFundMeBalance:${startFundMeBalance}`)
                  //console.log(`startDeployerBalance:${startDeployerBalance}`)

                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //console.log(`endFundMeBalance:${endFundMeBalance}`)
                  //console.log(`endDeployerBalance:${endDeployerBalance}`)

                  //assert
                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endDeployerBalance.add(gasCost).toString()
                  )

                  //Make sure that the funders are reset properly
                  //await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 0; i < 6; i++) {
                      await expect(fundMe.getFunder(i)).to.be.reverted
                  }

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to cheaperWithdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
