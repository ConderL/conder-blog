<template>
	<div class="oauth-background">
		<div id="preloader_6">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { giteeLogin, githubLogin, qqLogin } from "@/api/login";
import { useUserStore } from "@/store";
import { setToken } from "@/utils/token";

const user = useUserStore();
const router = useRouter();
const route = useRoute();

// 处理登录成功后的逻辑
const handleLoginSuccess = async (token: string) => {
	// 设置Token
	setToken(token);
	// 获取用户信息
	await user.GetUserInfo();
	if (user.email === "") {
		window.$message?.warning("请绑定邮箱以便及时收到回复");
	} else {
		window.$message?.success("登录成功");
	}
};

// 处理登录失败
const handleLoginError = (error: any) => {
	window.$message?.error(error.message || "登录失败");
};

// 处理登录请求
const handleOAuthLogin = async (
	type: "qq" | "gitee" | "github",
	token: string,
) => {
	if (!token) {
		window.$message?.error("登录失败：缺少令牌");
		return;
	}

	try {
		let response;
		switch (type) {
			case "qq":
				response = await qqLogin({ token });
				break;
			case "gitee":
				response = await giteeLogin({ token });
				break;
			case "github":
				response = await githubLogin({ token });
				break;
		}

		const { data } = response;
		if (data.flag) {
			await handleLoginSuccess(data.data);
		} else {
			window.$message?.error("登录失败");
		}
	} catch (error) {
		handleLoginError(error);
	}
};

// 处理路由跳转
const handleRouteRedirect = () => {
	const loginUrl = user.path;
	if (loginUrl != null && loginUrl != "") {
		router.push(loginUrl);
	} else {
		router.push("/");
	}
};

onMounted(() => {
	const path = route.path;
	const token = route.query.token as string;

	switch (path) {
		case "/oauth/login/qq":
			handleOAuthLogin("qq", token);
			break;
		case "/oauth/login/gitee":
			handleOAuthLogin("gitee", token);
			break;
		case "/oauth/login/github":
			handleOAuthLogin("github", token);
			break;
	}

	handleRouteRedirect();
});
</script>

<style scoped>
.oauth-background {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	z-index: 1000;
}

#preloader_6 {
	position: relative;
	top: 45vh;
	left: 47vw;
	animation: preloader_6 5s infinite linear;
}

#preloader_6 span {
	width: 20px;
	height: 20px;
	position: absolute;
	background: red;
	display: block;
	animation: preloader_6_span 1s infinite linear;
}

#preloader_6 span:nth-child(1) {
	background: #2ecc71;
}

#preloader_6 span:nth-child(2) {
	left: 22px;
	background: #9b59b6;
	animation-delay: 0.2s;
}

#preloader_6 span:nth-child(3) {
	top: 22px;
	background: #3498db;
	animation-delay: 0.4s;
}

#preloader_6 span:nth-child(4) {
	top: 22px;
	left: 22px;
	background: #f1c40f;
	animation-delay: 0.6s;
}

@keyframes preloader_6 {
	from {
		-ms-transform: rotate(0deg);
	}

	to {
		-ms-transform: rotate(360deg);
	}
}

@keyframes preloader_6_span {
	0% {
		transform: scale(1);
	}

	50% {
		transform: scale(0.5);
	}

	100% {
		transform: scale(1);
	}
}
</style>
