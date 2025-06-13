<template>
	<div class="menu">
		<div class="menu-item title">
			<NuxtLink to="/" class="menu-btn">
				{{ siteName }}
			</NuxtLink>
		</div>
		<template v-for="menu of menuList" :key="menu.name">
			<div v-if="!menu.children" class="menu-item" :class="{ active: route?.meta?.title === menu.name }">
				<NuxtLink :to="menu.path" class="menu-btn">
					<UIcon :name="`i-icon-${menu.icon}`" class="icon" />
					{{ menu.name }}
				</NuxtLink>
			</div>
			<div v-else class="menu-item dropdown">
				<a class="menu-btn drop">
					<UIcon :name="`i-icon-${menu.icon}`" class="icon" />
					{{ menu.name }}
				</a>
				<ul class="submenu">
					<li
						v-for="submenu of menu.children" :key="submenu.name" class="subitem"
						:class="{ active: route?.meta?.title === submenu.name }">
						<NuxtLink class="link" :to="submenu.path">
							<UIcon :name="`i-icon-${submenu.icon}`" class="icon" />
							{{ submenu.name }}
						</NuxtLink>
					</li>
				</ul>
			</div>
		</template>
		<div class="menu-item">
			<ClientOnly>
				<a v-if="!user.userInfo.id" class="menu-btn" @click="app.setLoginFlag(true)">
					<UIcon name="i-icon-user" class="icon" />
					登录
				</a>
				<template v-else>
					<img class="user-avatar drop cursor-pointer" :src="userAvatar"/>
					<ul class="submenu">
						<li class="subitem" :class="{ active: route?.meta?.title === '个人中心' }">
							<NuxtLink to="/user" class="link">
								<UIcon name="i-icon-user" class="icon" />
								个人中心
							</NuxtLink>
						</li>
						<li class="subitem">
							<a class="link" @click="logout">
								<UIcon name="i-icon-logout" class="icon" />
								退出
							</a>
						</li>
					</ul>
				</template>
			</ClientOnly>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
const user = useUserStore();
const app = useAppStore();
const blog = useBlogStore();

// 获取路由，在Nuxt中使用相关函数
const router = useRouter();
const route = useRoute();

// 使用计算属性获取用户头像
const userAvatar = computed(() => user.userInfo?.avatar || '/images/avatar/default.jpg');

// 使用固定值确保服务端和客户端一致性
const siteName = ref('博客');

// 客户端挂载后更新数据
onMounted(() => {
  if (blog.blogInfo && blog.blogInfo.siteConfig && blog.blogInfo.siteConfig.siteName) {
    siteName.value = blog.blogInfo.siteConfig.siteName;
  }
});

const logout = () => {
	if (route?.path === "/user") {
		router.go(-1);
	}
	// 使用正确的logout方法
	user.logout();
	
	// 提示消息
	if (typeof window !== 'undefined' && window.$message) {
		window.$message.success("退出成功");
	}
};

const menuList = [
	{
		name: "首页",
		icon: "home",
		path: "/"
	},
	{
		name: "文章",
		icon: "article",
		children: [
			{
				name: "归档",
				icon: "archives",
				path: "/archives"
			},
			{
				name: "分类",
				icon: "category",
				path: "/category"
			},
			{
				name: "标签",
				icon: "tag",
				path: "/tag"
			},
		]
	},
	{
		name: "娱乐",
		icon: "fun",
		children: [
			{
				name: "说说",
				icon: "talk",
				path: "/talk"
			},
			{
				name: "相册",
				icon: "album",
				path: "/album"
			},
			{
				name: "追番",
				icon: "anime",
				path: "/anime"
			}
		]
	},
	{
		name: "友链",
		icon: "friend",
		path: "/friend"
	},
	{
		name: "留言板",
		icon: "message",
		path: "/message"
	},
	{
		name: "关于",
		icon: "plane",
		path: "/about"
	},
];

// 默认导出
defineExpose({
  name: 'NavBar'
});
</script>

<style lang="scss" scoped>
.user-avatar {
	display: inline-block;
	position: relative;
	top: 0.3rem;
	width: 24px;
	height: 24px;
	border-radius: 50%;
}

.menu {
	display: flex;
	align-items: center;
	height: 100%;
}

.menu-item {
	position: relative;
	display: inline-block;
	padding: 0 0.625rem;
	letter-spacing: 0.0625rem;
	font-size: 17px;
	text-align: center;

	&:not(.title) .menu-btn::before {
		content: "";
		position: absolute;
		width: 0;
		height: 0.1875rem;
		bottom: 0;
		border-radius: 0.125rem;
		left: 50%;
		transform: translateX(-50%);
		background-color: currentColor;
		transition: all 0.4s ease-in-out 0s;
	}

	&:hover .submenu {
		display: block;
	}
}

.menu-item.active:not(.dropdown) .menu-btn::before,
.menu-item:not(.dropdown):hover .menu-btn::before {
	width: 70%;
}

.submenu {
	display: none;
	position: absolute;
	left: 7px;
	width: max-content;
	margin-top: 0.5rem;
	padding: 0;
	background: var(--grey-9-a5);
	box-shadow: 0 0.3125rem 1.25rem -0.25rem var(--grey-9-a1);
	border-radius: 0.625rem 0;
	animation: slideUpIn 0.3s;

	&::before {
		position: absolute;
		top: -1.25rem;
		left: 0;
		width: 100%;
		height: 2.5rem;
		content: "";
	}
}

.subitem {
	display: block;
	font-size: 1rem;

	&:first-child {
		border-radius: 0.625rem 0 0 0;
	}

	&:last-child {
		border-radius: 0 0 0.625rem 0;
	}

	.link {
		display: inline-block;
		padding: 0.3rem 0.7rem;
		width: 100%;
		text-shadow: none;
	}

	&:hover .link {
		transform: translateX(0.3rem);
	}
}

.submenu .subitem.active,
.submenu .subitem:hover {
	color: var(--grey-0);
	background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
	box-shadow: 0 0 0.75rem var(--color-pink-a3);
}

.sub.menu .submenu {
	background-color: var(--grey-1);
}

.drop::after {
	content: "";
	display: inline-block;
	vertical-align: middle;
	border: 0.3rem solid transparent;
	border-top-color: currentColor;
	border-bottom: 0;
}

@media (max-width: 865px) {
	.menu {
		justify-content: center;
	}

	.menu .menu-item {
		display: none;
	}

	.menu .title {
		display: block;
	}
}
</style> 