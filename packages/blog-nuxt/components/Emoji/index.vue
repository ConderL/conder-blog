<template>
	<UPopover
		mode="click"
		:content="{
			side: 'right',
			align: 'start',
			alignOffset: 0,
			avoidCollisions: true,
			collisionPadding: 8
		}"
	>
		<UButton 
			color="gray" 
			variant="ghost" 
			class="!p-0 h-auto" 
			icon="icon:emoji" 
			aria-label="表情"
		/>
		<template #content>
			<div class="emoji-container">
				<div class="emoji-title">
					{{ emojiTitle }}
				</div>
				<div v-if="emojiType === 0" class="emoji-content">
					<span
						v-for="(value, key, index) of emojiMap"
						:key="index"
						class="emoji-item cursor-pointer"
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
				<div v-if="emojiType === 1" class="emoji-content">
					<span
						v-for="(value, key, index) of emojiGenshinMap"
						:key="index"
						class="emoji-item"
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
				<div v-if="emojiType === 2" class="emoji-content">
					<span
						v-for="(value, key, index) of emojiMygoMap"
						:key="index"
						class="emoji-item"
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
				<div v-if="emojiType === 3" class="emoji-content">
					<span
						v-for="(value, index) in textList"
						:key="index"
						class="text-emoji cursor-pointer"
						@click="addEmoji(value)"
					>
						{{ value }}
					</span>
				</div>
				<div class="emoji-tabs">
					<div
						class="emoji-tab cursor-pointer"
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
			</div>
		</template>
	</UPopover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { emojiList } from '~/utils/emoji';
import { emojiGenshinList } from '~/utils/emojiGenshin';
import { emojiMygoList } from '~/utils/emojiMygo';
import { textList } from '~/utils/text';

// 使用导入的表情数据
const emojiMap = emojiList;
const emojiGenshinMap = emojiGenshinList;
const emojiMygoMap = emojiMygoList;

// 当前表情类型
const emojiType = ref(0);

// 定义组件事件
const emit = defineEmits(["addEmoji", "chooseType"]);

// 计算当前表情类型标题
const emojiTitle = computed(() => {
	switch (emojiType.value) {
		case 0:
			return "小黄脸";
		case 1:
			return "原神";
		case 2:
			return "MyGO!!!!!";
		case 3:
			return "颜文字";
	}
});

// 处理添加表情
const addEmoji = (key: string) => {
	emit("addEmoji", key);
};

// 处理切换表情类型
const chooseType = (key: number) => {
	emojiType.value = key;
	emit("chooseType", key);
};
</script>

<style lang="scss" scoped>
.emoji-content {
	height: 120px;
	overflow: auto;
	padding: 0px 8px;
}

.emoji-title {
	padding: 8px 15px 0px 12px;
	border-bottom: 1px solid rgb(239, 239, 245);
}

.emoji-item {
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

		&:hover {
			background-color: #ddd;
		}
	}

	.on {
		background-color: #fff;
	}
}
</style> 