<template>
  <div class="anime-card" @click="openAnimeDetail">
    <div class="anime-card-cover">
      <img :src="anime.cover || ''" alt="番剧封面" class="cover-img">
      <div class="anime-card-status">
        <span v-if="anime.area" :class="getAreaTagClass(anime.area.id)">
          {{ anime.area.name }}
        </span>
        <span :class="getAnimeStatusClass(anime.animeStatus)">
          {{ getAnimeStatusLabel(anime.animeStatus) }}
        </span>
      </div>
      <div v-if="anime.rating" class="anime-card-rating">
        {{ anime.rating }}分
      </div>
    </div>
    <div class="anime-card-info">
      <h3 class="anime-card-title">{{ anime.animeName || '未知番剧' }}</h3>
      <div class="anime-card-meta">
        <span v-if="anime.views" class="meta-item">{{ formatNumber(anime.views) }}播放</span>
        <span v-if="anime.ratingCount" class="meta-item">{{ formatNumber(anime.ratingCount) }}人评分</span>
      </div>
      <div class="anime-card-desc" :title="anime.description">
        {{ truncateText(anime.description, 80) }}
      </div>
      <div class="anime-card-footer">
        <span v-if="anime.totalEpisodes" class="episodes">
          <template v-if="anime.platform === 1">
            {{ anime.currentEpisodes || 0 }}/{{ anime.totalEpisodes }}集
          </template>
          <template v-else>
            {{ anime.totalEpisodes }}集
          </template>
        </span>
        <span v-if="anime.styles" class="styles">{{ formatStyles(anime.styles) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Anime {
  id: number;
  animeName: string;
  cover?: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  animeStatus?: number;
  totalEpisodes?: number;
  currentEpisodes?: number;
  platform?: number;
  area?: { id: number; name: string };
  styles?: string | string[];
  views?: number;
  publishTime?: string;
}

interface Props {
  anime: Anime;
}

const props = defineProps<Props>();
const router = useRouter();

const openAnimeDetail = () => {
  if (props.anime.platform === 1 && props.anime.id) {
    window.open(`https://www.bilibili.com/bangumi/play/ss${props.anime.id}`, '_blank');
  } else {
    router.push(`/anime?id=${props.anime.id}`);
  }
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatStyles = (styles: string | string[]) => {
  if (!styles) return '';
  if (typeof styles === 'string') {
    try {
      const parsedStyles = JSON.parse(styles);
      return Array.isArray(parsedStyles) ? parsedStyles.join(' / ') : styles;
    } catch (e) {
      return styles;
    }
  } else if (Array.isArray(styles)) {
    return styles.join(' / ');
  }
  return '';
};

const getAnimeStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '连载中',
    2: '已完结'
  };
  return statusMap[status] || '未知状态';
};

const getAnimeStatusClass = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'status-ongoing',
    2: 'status-finished'
  };
  return `status-tag ${statusMap[status] || ''}`;
};

const getAreaTagClass = (areaId: number) => {
  const areaMap: Record<number, string> = {
    1: 'area-tag-guo',
    2: 'area-tag-ri',
    3: 'area-tag-mei'
  };
  return areaMap[areaId] || 'area-tag';
};
</script>

<style lang="scss" scoped>
.anime-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--grey-1);
  border: 1px solid var(--grey-3);
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
  
  &:hover {
    background: var(--grey-2);
    border-color: var(--color-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.anime-card-cover {
  position: relative;
  width: 80px;
  height: 107px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  
  .cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .anime-card-status {
    position: absolute;
    top: 4px;
    left: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .anime-card-rating {
    position: absolute;
    bottom: 4px;
    right: 4px;
    padding: 2px 6px;
    background: rgba(255, 127, 36, 0.9);
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
  }
}

.anime-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.anime-card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--text-color);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  &:hover {
    color: var(--color-blue);
  }
}

.anime-card-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  
  .meta-item {
    margin-right: 10px;
    
    &:not(:last-child)::after {
      content: "·";
      margin-left: 10px;
    }
  }
}

.anime-card-desc {
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.anime-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
  
  .episodes {
    font-weight: 500;
  }
  
  .styles {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
  }
}

.status-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}

.status-ongoing {
  background-color: #F85A54;
}

.status-finished {
  background-color: #9499A0;
}

.area-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-left: 2px solid #ff9800;
}

.area-tag-guo {
  background-color: rgba(0, 0, 0, 0.6);
  border-left-color: var(--color-red);
  color: var(--color-red);
}

.area-tag-ri {
  background-color: rgba(0, 0, 0, 0.6);
  border-left-color: var(--color-blue);
  color: var(--color-blue);
}

.area-tag-mei {
  background-color: rgba(0, 0, 0, 0.6);
  border-left-color: var(--color-purple);
  color: var(--color-purple);
}
</style>

