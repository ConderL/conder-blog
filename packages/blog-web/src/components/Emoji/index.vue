<template>
	<n-popover
		trigger="click"
		placement="bottom-start"
		style="max-height: 200px"
		content-style="padding: 0 8px;"
		:width="250"
		header-style="padding: 8px 15px 0 12px;font-size: 12px;"
		footer-style="padding: 0;"
		:to="false"
	>
		<template #trigger>
			<span><svg-icon icon-class="emoji"></svg-icon></span>
		</template>
		<template #header>
			<div class="emoji-title">
				{{ emojiTitle }}
			</div>
		</template>
		<div class="emoji-content" v-if="emojiType === 0">
			<span
				class="emoji-item"
				v-for="(value, key, index) of emojiList"
				:key="index"
				@click="addEmoji(key)"
			>
				<img
					:src="value"
					:title="key"
					class="emoji"
					width="24"
					height="24"
				/>
			</span>
		</div>
		<div class="emoji-content" v-if="emojiType === 1">
			<span
				class="emoji-item"
				v-for="(value, key, index) of emojiGenshinList"
				:key="index"
				@click="addEmoji(key)"
			>
				<img
					:src="value"
					:title="key"
					class="emoji"
					width="24"
					height="24"
				/>
			</span>
		</div>
		<div class="emoji-content" v-if="emojiType === 2">
			<span
				class="emoji-item"
				v-for="(value, key, index) of emojiMygoList"
				:key="index"
				@click="addEmoji(key)"
			>
				<img
					:src="value"
					:title="key"
					class="emoji"
					width="24"
					height="24"
				/>
			</span>
		</div>
		<div class="emoji-content" v-if="emojiType === 3">
			<span
				class="text-emoji"
				v-for="(value, index) in textList"
				:key="index"
				@click="addEmoji(value)"
			>
				{{ value }}
			</span>
		</div>
		<template #footer>
			<div class="emoji-tabs">
				<div
					class="emoji-tab"
					:class="{ on: emojiType === 0 }"
					@click="chooseType(0)"
				>
					<img
						src="https://img.conder.top/emoji/tv.png"
						width="22"
						height="22"
					/>
				</div>
				<div
					class="emoji-tab"
					:class="{ on: emojiType === 1 }"
					@click="chooseType(1)"
				>
					<img
						src="https://img.conder.top/emoji/genshin.png"
						width="22"
						height="22"
					/>
				</div>
				<div
					class="emoji-tab"
					:class="{ on: emojiType === 2 }"
					@click="chooseType(2)"
				>
					<img
						src="https://img.conder.top/emoji/MyGO!!!!!.png"
						width="22"
						height="22"
					/>
				</div>
				<div
					class="emoji-tab"
					:class="{ on: emojiType === 3 }"
					@click="chooseType(3)"
				>
					<img
						src="https://img.conder.top/emoji/smileys.png"
						width="22"
						height="22"
					/>
				</div>
			</div>
		</template>
	</n-popover>
</template>

<script setup lang="ts">
import { emojiList } from "@/utils/emoji";
import { textList } from "@/utils/text";
import { emojiGenshinList } from "@/utils/emojiGenshin";
import { emojiMygoList } from "@/utils/emojiMygo";

const emojiType = ref(0);
const emit = defineEmits(["addEmoji", "chooseType"]);

const emojiTitle = computed(() => {
	switch (emojiType.value) {
		case 0:
			return "小黄脸";
		case 1:
			return "genshin";
		case 2:
			return "MyGO!!!!!";
		case 3:
			return "颜文字";
	}
});

const addEmoji = (key: string) => {
	emit("addEmoji", key);
};
const chooseType = (key: number) => {
	emojiType.value = key;
	emit("chooseType", key);
};
</script>

<style lang="scss" scoped>
.emoji-content {
	height: 120px;
	overflow: auto;
}

.emoji-item {
	cursor: pointer;
	display: inline-block;

	.emoji {
		user-select: none;
		margin: 0.25rem;
		display: inline-block;
		vertical-align: middle;
	}
}

.text-emoji {
	display: inline-block;
	cursor: pointer;
	padding: 5px 8px;
	font-size: 12px;
	line-height: 22px;
}

.emoji-item:hover,
.text-emoji:hover {
	transition: all 0.2s;
	border-radius: 0.25rem;
	background: #dddddd;
}

.emoji-tabs {
	display: flex;
	background-color: #f1f2f3;

	.emoji-tab {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 58px;
		height: 36px;
		padding: 7px 18px;
		cursor: pointer;

		&:hover {
			background-color: #ddd;
		}
	}

	.on {
		background-color: #fff;
	}
}
</style>
