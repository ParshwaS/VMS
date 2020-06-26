const puppet = require('puppeteer')
const path = require('path')

module.exports = async function (app, io) {

	const browser = await puppet.launch({
		args: ['--no-sandbox', '--disable-web-security'],
		headless: false,
		userDataDir: process.cwd() + '/whatsappData'
	});

	const page = await browser.newPage()
	await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
	await page.setBypassCSP(true)
	await page.goto('https://web.whatsapp.com/')
	await checkLoaded()
	let logged = await checkLogin(5000)
	if(logged){
		var filepath = path.join(__dirname, "WAPI.js");
		await page.addScriptTag({ path: require.resolve(filepath) });
	}

	console.log("Browser is ready to use...")

	function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time))
	}
	
	io.on("sendMessage", async(data)=>{
		let ans = await page.evaluate(`WAPI.sendMessage(${data.to}, ${data.message});`)
		console.log(ans)
	})

	async function checkLogin(time = 1000) {
		let ans = await page.waitForXPath('//div[contains(text(),"Search or start new chat")]', { timeout: time }).then(async () => {
			return true;
		}).catch(async () => {
			let use = await page.waitForXPath('//div[contains(text(),"Use Here")]', { timeout: time }).then(() => {
				return true
			}).catch(() => {
				return false
			})
			if (use) {
				let button = await page.$x('//div[contains(text(),"Use Here")]');
				await button[0].click()
				return true
			} else {
				return false
			}
		})
		return ans
	}

	async function checkIfLogged() {
		let logged = await checkLogin();
		if (!logged) {
			checkIfLogged()
		} else {
			var filepath = path.join(__dirname, "WAPI.js");
			await page.addScriptTag({ path: require.resolve(filepath) });
			io.sockets.emit('WhatsappStatus')
		}
	}

	async function checkLoaded() {
		let startup = true;
		for (let i = 0; i <= 100; i += 1) {
			await delay(1000)
			startup = await page.waitForSelector('#startup', { timeout: 1500 }).then(() => { return true }).catch(() => { return false });
			if (!startup) {
				break
			}
		}
		return !startup
	}

	async function checkReload() {
		await page.waitForSelector("span[data-icon='refresh-large']", { timeout: 500 }).then(() => {
			page.click("span[data-icon='refresh-large']")
		}).catch(() => {
		})
		await delay(200)
	}

	var messageQueue = []
	var working = false

	async function addInQueue(company_id, number, message) {
		messageQueue.push({ pageID: company_id, contact: number, message: message })
	}

	async function workOnQueue() {
		working = true
		if (messageQueue.length > 0) {
			const data = messageQueue.pop()
			const logged = await checkLogin()
			if (logged) {
				let res = await page.evaluate(`WAPI.sendMessage("${data.contact}@c.us","${data.message}")`)
			}
			if (messageQueue.length > 0) {
				workOnQueue()
			} else {
				working = false
			}
		}
	}

	app.post('/api/whatsapp/getQR', (req, res) => {
		(async () => {
			if (page == null) {
				res.json({ message: "Page isn't ready" })
			} else {
				await checkReload()
				let qr = await page.waitForSelector('canvas[role="img"]').then((element) => { return element }).catch((error) => { return null })
				if (qr) {
					const image = await qr.screenshot({encoding: 'base64'})
					res.json({status: true, image: "data:image/png;base64,"+image})
					checkIfLogged()
				} else {
					res.json({ error: "Something went wrong" })
				}
			}
		})();
	})

	app.post('/api/whatsapp/checkStatus', (req, res) => {
		(async () => {
			if (page == null) {
				res.json({ message: "Page isn't ready" })
			} else {
				let starting = await page.waitForSelector('#startup', { timeout: 1500 }).then(() => { return true }).catch(() => { return false });
				if (starting) {
					await checkLoaded()
				}
				let answer = await checkLogin()
				if (answer) {
					var filepath = path.join(__dirname, "WAPI.js");
					await page.addScriptTag({ path: require.resolve(filepath) });
				}
				res.json({ status: answer })
			}
		})();
	})
}