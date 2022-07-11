const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../help-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //set price feed address
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        //get address of MockV3Aggregator contract
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //deploy
    log("Deploying fundme...")
    const args = [ethUsdPriceFeedAddress]
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address
        log: true,
        //waitConfirmations: network.config.blockConfirmations || 1,
        waitConfirmations: 1,
    })

    //virify
    /*
    log("Virifying fundme...")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(FundMe.address, args)
    }
    */
    log("-----------------------------------------")
}

module.exports.tags = ["all", "fundme"]
