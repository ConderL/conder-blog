import { App } from "vue";

export function loadSocketIO() {
	return new Promise((resolve, reject) => {
		if (window.io) {
			resolve(window.io);
			return;
		}

		const script = document.createElement("script");
		script.src =
			"https://unpkg.com/socket.io-client@4.7.2/dist/socket.io.min.js";
		script.async = true;
		script.onload = () => resolve(window.io);
		script.onerror = (err) => reject(err);
		document.head.appendChild(script);
	});
}

export default {
	install(app: App) {
		app.config.globalProperties.$socketIO = loadSocketIO;

		// 声明window上的io属性
		declare global {
			interface Window {
				io: any;
			}
		}
	},
};
