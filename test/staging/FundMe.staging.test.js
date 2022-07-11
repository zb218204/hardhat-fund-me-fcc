const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../help-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let deployer
          let fundMe
          const sendValue = ethers.utils.parseEther("0.1") //0.1ETH
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("Allows people to fund and withdraw", async function () {
              //await fundMe.fund({ value: sendValue })
              //await fundMe.withdraw()
              const transactionResponse = await fundMe.withdraw()
              await transactionResponse.wait(1)
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
