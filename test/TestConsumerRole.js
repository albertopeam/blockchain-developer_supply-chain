const ConsumerRole = artifacts.require('ConsumerRole')
const truffleAssert = require('truffle-assertions');

contract('ConsumerRole', function(accounts) {
    beforeEach('Setup', async () => {
        sut = await ConsumerRole.deployed()
    })

    it("Creating consumer role makes creator a consumer", async() => {
        assert.equal(await sut.isConsumer(accounts[0]), true)
    })

    it("Creating consumer role makes non creator non consumer", async() => {
        assert.equal(await sut.isConsumer(accounts[1]), false)
    })

    it("Adding a consumer role makes it a consumer", async() => {
        const tx = await sut.addConsumer(accounts[4])

        assert.equal(assert.equal(await sut.isConsumer(accounts[4]), true))
        truffleAssert.eventEmitted(tx, 'ConsumerAdded', (ev) => { return ev.account === accounts[4] })
        await sut.renounceConsumer({from: accounts[4]})
    })

    it("Renounce a consumer role makes it a non consumer", async() => {
        await sut.addConsumer(accounts[4])
        assert.equal(assert.equal(await sut.isConsumer(accounts[4]), true))
        const tx = await sut.renounceConsumer({from: accounts[4]})
        
        assert.equal(assert.equal(await sut.isConsumer(accounts[4]), false))
        truffleAssert.eventEmitted(tx, 'ConsumerRemoved', (ev) => { return ev.account === accounts[4] })
    })
})