const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

require("dotenv").config();

puppeteer.use(StealthPlugin());

(async () => {
	const browser = await puppeteer.launch({
		// executablePath:
		// 	"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		headless: false,
		args: [
			"--disable-web-security",
			"--disable-features=site-per-process",
			"--window-size=1920,1080",
		],
		// slowMo: 500,
		devtools: false,
	});
	const loginPage = (await browser.pages())[0];
	await loginPage.setViewport({
		width: 1920,
		height: 1080,
	});
	await loginPage.setUserAgent(
		"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
	);
	console.log("Directing to PAWS Portal...");
	await loginPage.goto("https://pawsportal.gsu.edu/login/?embedded=true");
	await loginPage.waitForTimeout(1000);
	console.log("Logging in...");
	await loginPage.type(
		"[id='loginForm:username']",
		process.env.PAWS_PORTAL_USERNAME
	);

	await loginPage.type(
		"[id='loginForm:password']",
		process.env.PAWS_PORTAL_PASSWORD
	);

	await loginPage.click("[id='loginForm:loginButton']", (btn) => {
		btn.click();
	});

	/*-----------------------------------*/
	console.log("Resolving Duo Two-Factor Authentication...");
	await loginPage.waitForSelector("iframe", { visible: true });

	const frameHandler = await loginPage.$("#duo_iframe");

	const frame = await frameHandler.contentFrame();
	await frame.waitForTimeout(500);
	await frame.waitForSelector('button[id="passcode"]', { visible: true });
	const enterPassCodeClick = await frame.$('button[id="passcode"]');
	await enterPassCodeClick.click();

	const passcode = await frame.$("input[name='passcode']");
	await passcode.type(process.env.PAWS_PORTAL_DUO_PASSCODE);

	await enterPassCodeClick.click();
	console.log("Logged in!");
	const dashboard = await browser.newPage();
	console.log("Navigating to Fall Semester Registration Page...");
	await dashboard.goto("https://pawsportal.gsu.edu/");
	const accknowledgeButton = await dashboard.waitForSelector(
		"button[class='btn']"
	);
	await accknowledgeButton.click();

	await dashboard.goto(
		"https://registration.gosolar.gsu.edu/StudentRegistrationSsb/ssb/registration/registerPostSignIn?mode=registration"
	);

	const dropdown = await dashboard.$("b[role='presentation']");
	await dropdown.click();

	await dashboard.waitForSelector("div[id='202208']", { visible: true });
	const fallSemester = await dashboard.$("div[id='202208']");
	await fallSemester.click();

	const submitSemester = await dashboard.$("button[id='term-go']");
	await submitSemester.click();

	// console.log(fallSemester);
	// const dropdown = await dashboard.waitForSelector(
	// 	"div[id='select2-drop-mask']"
	// );
	// await dropdown.click();

	// const fallSemester = await dashboard.$("202208");
	// await fallSemester.click();

	// const accknowledgeButton = await dashboard.$("button[class='btn']");
	// await accknowledgeButton.click();
	// await page.type('input[name="email"]', process.env.FINISH_LINE_EMAIL);
	//*[@id="loginForm"]/div[1]/input
	// 	await page.type;
	// 	// await page.waitForTimeout(100);
	// 	// console.log("Selecting Size...");
	// 	// // const loginButton = await page.$(".cl-sign-in-link");
	// 	// // await loginButton.click();
	// await page.click("button[data-size='4.0']", (btn) => btn.click());
	// 	// await page.waitForTimeout(100);
	// 	// console.log("Adding To Cart...");
	// 	// await page.click("#buttonAddToCart", (btn) => {
	// 	// 	btn.click();
	// 	// });
	// 	// console.log("Cheking Out...");
	// 	await page.screenshot({ path: "./example.png" });
})();
