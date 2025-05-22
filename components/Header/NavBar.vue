<template>
	<div class="menu">
		<div class="menu-item title">
			<NuxtLink to="/" class="menu-btn">
				{{ siteName }}
			</NuxtLink>
		</div>
		<template v-for="menu of menuList" :key="menu.name">
			<div v-if="!menu.children" class="menu-item" :class="{ active: route.meta.title === menu.name }">
				<NuxtLink :to="menu.path" class="menu-btn">
					<component :is="getIconComponent(menu.icon)" />
					{{ menu.name }}
				</NuxtLink>
			</div>
			<div v-else class="menu-item dropdown">
				<a class="menu-btn drop">
					<component :is="getIconComponent(menu.icon)" />
					{{ menu.name }}
				</a>
				<ul class="submenu">
					<li class="subitem" v-for="submenu of menu.children" :key="submenu.name"
						:class="{ active: route.meta.title === submenu.name }">
						<NuxtLink class="link" :to="submenu.path">
							<component :is="getIconComponent(submenu.icon)" />
							{{ submenu.name }}
						</NuxtLink>
					</li>
				</ul>
			</div>
		</template>
		<div class="menu-item">
			<ClientOnly>
				<a v-if="!user.userInfo.id" @click="app.loginDialogVisible = true" class="menu-btn">
					<UserIcon />
					登录
				</a>
				<template v-else>
					<img class="user-avatar drop" :src="userAvatar"/>
					<ul class="submenu">
						<li class="subitem" :class="{ active: route.meta.title === '个人中心' }">
							<NuxtLink to="/user" class="link">
								<AuthorIcon />
								个人中心
							</NuxtLink>
						</li>
						<li class="subitem">
							<a class="link" @click="logout">
								<LogoutIcon />
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
import { computed, ref } from 'vue';
import { useStore } from '~/store';
import { useUserStore } from '~/store/modules/user';
import { useAppStore } from '~/store/modules/app';
import { useBlogStore } from '~/store/modules/blog';

// 导入图标组件
import HomeIcon from '~/assets/icons/home.svg';
import ArticleIcon from '~/assets/icons/article.svg';
import ArchivesIcon from '~/assets/icons/archives.svg';
import CategoryIcon from '~/assets/icons/category.svg';
import TagIcon from '~/assets/icons/tag.svg';
import TalkIcon from '~/assets/icons/talk.svg';
import AlbumIcon from '~/assets/icons/album.svg';
import FriendIcon from '~/assets/icons/friend.svg';
import MessageIcon from '~/assets/icons/message.svg';
import PlaneIcon from '~/assets/icons/plane.svg';
import UserIcon from '~/assets/icons/user.svg';
import AuthorIcon from '~/assets/icons/author.svg';
import LogoutIcon from '~/assets/icons/logout.svg';

const user = useUserStore();
const app = useAppStore();
const blog = useBlogStore();

// 获取路由
const router = useRouter();
const route = useRoute();

// 默认头像
const defaultAvatar = '/img/default_avatar.jpg';

// 计算用户头像
const userAvatar = computed(() => {
	return user.userInfo?.avatar || defaultAvatar;
});

// 图标组件映射
const iconComponents = {
  'home': HomeIcon,
  'article': ArticleIcon,
  'archives': ArchivesIcon,
  'category': CategoryIcon,
  'tag': TagIcon,
  'talk': TalkIcon,
  'album': AlbumIcon,
  'friend': FriendIcon,
  'message': MessageIcon,
  'plane': PlaneIcon,
  'user': UserIcon,
  'author': AuthorIcon,
  'logout': LogoutIcon
};

// 获取图标组件方法
const getIconComponent = (name) => {
  return iconComponents[name] || 'div';
};

// 网站名称
const siteName = computed(() => {
	return blog.blogInfo?.siteConfig?.siteName || 'Conder Blog';
});

// 菜单列表
const menuList = ref([
	{ name: '首页', path: '/', icon: 'home' },
	{ name: '文章', path: '/article', icon: 'article' },
	{ name: '归档', path: '/archives', icon: 'archives' },
	{ name: '分类', path: '/category', icon: 'category' },
	{ name: '标签', path: '/tag', icon: 'tag' },
	{ name: '动态', path: '/talk', icon: 'talk' },
	{ name: '旅行', path: '/album', icon: 'album' },
	{ name: '友链', path: '/friend', icon: 'friend' },
	{ name: '留言', path: '/message', icon: 'message' },
	{ name: '投稿', path: '/plane', icon: 'plane' }
]);

// 退出登录
const logout = () => {
	user.logout();
	router.push('/');
};
</script>

<style lang="scss" scoped>
.menu {
	font-size: 1.25rem;
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
}

.menu-item {
	position: relative;
	margin: 0 0.625rem;
	
	&.active .menu-btn {
		color: var(--btn-color);
	}
}

.menu-btn {
	padding: 0.3125rem 0.3125rem;
	transition: all 0.2s ease-in-out 0s;
	
	&:hover {
		color: var(--btn-color);
	}
	
	&.drop:after {
		content: "\f107";
		font-style: normal;
	}
}

.title .menu-btn {
	font-size: 1.5625rem;
	letter-spacing: 0.25rem;
	font-family: "NotoSerifSC", Helvetica, sans-serif !important;
	
	&:hover {
		color: var(--grey-3);
	}
}

.submenu {
	display: none;
	position: absolute;
	left: -0.125rem;
	z-index: 1;
	color: var(--grey-0);
	background: var(--grey-9-a1);
	backdrop-filter: saturate(180%) blur(20px);
	min-width: 6.25rem;
	padding: 0.625rem 0;
	border-radius: 0.3125rem;
	text-align: center;
	
	.link {
		display: block;
		padding: 0.3125rem 0.625rem;
		max-width: 6.875rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		
		&:hover {
			color: var(--btn-color);
		}
	}
	
	.subitem.active a {
		color: var(--btn-color);
	}
}

.dropdown:hover .submenu,
.menu-item:hover .submenu {
	display: block;
}

.user-avatar {
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
	cursor: pointer;
	box-shadow: var(--box-bg-shadow);
}

// 设置所有SVG图标的样式
:deep(svg) {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.125em;
  margin-right: 0.25rem;
}

@media (max-width: 767px) {
	.menu {
		margin-top: 1.25rem;
		justify-content: flex-start;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 0.3125rem;
		mask-image: linear-gradient(to right, transparent, #000 15px, #000 97%, transparent);
		
		.menu-item {
			font-size: 0.875rem;
			margin: 0 0.1875rem;
		}
		
		.menu-btn {
			padding: 0.1875rem;
		}
		
		.title .menu-btn {
			font-size: 1.125rem;
			letter-spacing: 0.125rem;
		}
	}
}
</style> 