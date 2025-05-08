/**
 * 防抖函数
 * 在一定时间内多次调用同一函数，只执行最后一次调用
 *
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 300
): (...args: Parameters<T>) => void {
	let timer: number | null = null;

	return function (this: any, ...args: Parameters<T>): void {
		if (timer) {
			clearTimeout(timer);
		}

		timer = window.setTimeout(() => {
			fn.apply(this, args);
			timer = null;
		}, delay);
	};
}

/**
 * 点击防抖 - 跟踪最近点击的ID，防止短时间内对同一ID多次操作
 */
export class ClickDebouncer {
	private lastClickedIds: Map<number, number> = new Map();
	private timeout: number;

	/**
	 * 创建点击防抖器
	 * @param timeout 防抖超时时间(毫秒)
	 */
	constructor(timeout: number = 800) {
		this.timeout = timeout;
	}

	/**
	 * 检查ID是否可以点击
	 * @param id 检查的ID
	 * @returns 是否可以点击
	 */
	canClick(id: number): boolean {
		const now = Date.now();
		const lastTime = this.lastClickedIds.get(id) || 0;

		if (now - lastTime < this.timeout) {
			console.log(`ID ${id} 点击过于频繁，请稍后再试`);
			return false;
		}

		this.lastClickedIds.set(id, now);
		return true;
	}

	/**
	 * 清除特定ID的记录
	 * @param id 要清除的ID
	 */
	clear(id: number): void {
		this.lastClickedIds.delete(id);
	}

	/**
	 * 清除所有记录
	 */
	clearAll(): void {
		this.lastClickedIds.clear();
	}
}
