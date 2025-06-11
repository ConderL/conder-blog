<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-wrapper">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="番剧名称" prop="animeName">
          <el-input
            v-model="queryParams.animeName"
            placeholder="请输入番剧名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="番剧平台" prop="platform">
          <el-select v-model="queryParams.platform" placeholder="请选择番剧平台" clearable style="width: 200px">
            <el-option
              v-for="dict in platformOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="番剧状态" prop="animeStatus">
          <el-select v-model="queryParams.animeStatus" placeholder="请选择番剧状态" clearable style="width: 200px">
            <el-option
              v-for="dict in animeStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="追番状态" prop="watchStatus">
          <el-select v-model="queryParams.watchStatus" placeholder="请选择追番状态" clearable style="width: 200px">
            <el-option
              v-for="dict in watchStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card shadow="never">
      <div class="table-toolbar">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPerm="['blog:anime:add']"
        >新增</el-button>
        <el-button
          type="success"
          icon="el-icon-refresh"
          @click="handleRunTask"
          v-hasPerm="['blog:anime:update']"
        >更新所有番剧信息</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="animeList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" width="60" align="center" />
        <el-table-column label="封面" width="100" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.cover"
              :src="scope.row.cover"
              style="width: 80px; height: 80px"
              :preview-src-list="[scope.row.cover]"
            />
            <el-image
              v-else
              src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column label="番剧名称" prop="animeName" :show-overflow-tooltip="true" />
        <el-table-column label="番剧平台" align="center" width="100">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(scope.row.platform)">
              {{ getPlatformLabel(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="番剧ID" prop="animeId" width="100" align="center" />
        <el-table-column label="番剧状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.animeStatus === 1 ? 'warning' : 'success'">
              {{ scope.row.animeStatus === 1 ? '连载中' : '已完结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="追番状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="getWatchStatusTagType(scope.row.watchStatus)">
              {{ getWatchStatusLabel(scope.row.watchStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分" prop="rating" width="80" align="center" />
        <el-table-column label="集数" align="center" width="100">
          <template #default="scope">
            {{ scope.row.currentEpisodes || 0 }}/{{ scope.row.totalEpisodes || '?' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.lastUpdateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template #default="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleView(scope.row)"
              v-hasPerm="['blog:anime:query']"
            >查看</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPerm="['blog:anime:edit']"
            >编辑</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-refresh"
              @click="handleUpdateInfo(scope.row)"
              v-hasPerm="['blog:anime:update']"
            >更新信息</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPerm="['blog:anime:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="番剧名称" prop="animeName">
          <el-input v-model="form.animeName" placeholder="请输入番剧名称" />
        </el-form-item>
        <el-form-item label="番剧平台" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择番剧平台">
            <el-option
              v-for="dict in platformOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="番剧ID" prop="animeId">
          <el-input v-model="form.animeId" placeholder="请输入番剧ID" />
        </el-form-item>
        <el-form-item label="番剧状态" prop="animeStatus">
          <el-select v-model="form.animeStatus" placeholder="请选择番剧状态">
            <el-option
              v-for="dict in animeStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="追番状态" prop="watchStatus">
          <el-select v-model="form.watchStatus" placeholder="请选择追番状态">
            <el-option
              v-for="dict in watchStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="番剧详情" v-model="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="番剧名称">{{ viewForm.animeName }}</el-descriptions-item>
        <el-descriptions-item label="番剧平台">{{ getPlatformLabel(viewForm.platform) }}</el-descriptions-item>
        <el-descriptions-item label="番剧ID">{{ viewForm.animeId }}</el-descriptions-item>
        <el-descriptions-item label="番剧状态">
          {{ viewForm.animeStatus === 1 ? '连载中' : '已完结' }}
        </el-descriptions-item>
        <el-descriptions-item label="追番状态">{{ getWatchStatusLabel(viewForm.watchStatus) }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ viewForm.rating || '暂无评分' }}</el-descriptions-item>
        <el-descriptions-item label="集数">
          {{ viewForm.currentEpisodes || 0 }}/{{ viewForm.totalEpisodes || '?' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(viewForm.lastUpdateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="封面" :span="2">
          <el-image
            v-if="viewForm.cover"
            :src="viewForm.cover"
            style="max-width: 200px; max-height: 200px"
            :preview-src-list="[viewForm.cover]"
          />
          <span v-else>暂无封面</span>
        </el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">
          {{ viewForm.description || '暂无简介' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnimeList, getAnimeDetail, addAnime, updateAnime, deleteAnime, updateAnimeInfo, runUpdateTask } from '@/api/anime'
import { formatDateTime } from "@/utils/date"

// 遮罩层
const loading = ref(false)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 总条数
const total = ref(0)
// 番剧表格数据
const animeList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 是否显示查看详情弹出层
const viewOpen = ref(false)

// 表单参数
const form = reactive({
  id: undefined,
  animeName: '',
  platform: 1,
  animeId: '',
  animeStatus: 1,
  watchStatus: 1
})

// 查看详情表单
const viewForm = reactive({
  id: undefined,
  animeName: '',
  platform: undefined,
  animeId: '',
  animeStatus: undefined,
  watchStatus: undefined,
  cover: '',
  rating: undefined,
  totalEpisodes: undefined,
  currentEpisodes: undefined,
  lastUpdateTime: undefined,
  description: ''
})

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  animeName: undefined,
  platform: undefined,
  animeStatus: undefined,
  watchStatus: undefined
})

// 表单校验
const rules = {
  animeName: [
    { required: true, message: '番剧名称不能为空', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '番剧平台不能为空', trigger: 'change' }
  ],
  animeId: [
    { required: true, message: '番剧ID不能为空', trigger: 'blur' }
  ],
  animeStatus: [
    { required: true, message: '番剧状态不能为空', trigger: 'change' }
  ],
  watchStatus: [
    { required: true, message: '追番状态不能为空', trigger: 'change' }
  ]
}

// 番剧平台选项
const platformOptions = [
  { value: 1, label: 'bilibili' },
  { value: 2, label: '腾讯视频' },
  { value: 3, label: '爱奇艺' },
  { value: 4, label: '优酷' }
]

// 番剧状态选项
const animeStatusOptions = [
  { value: 1, label: '连载中' },
  { value: 2, label: '已完结' }
]

// 追番状态选项
const watchStatusOptions = [
  { value: 1, label: '想看' },
  { value: 2, label: '在看' },
  { value: 3, label: '已看' }
]

// 表单ref
const formRef = ref(null)
const queryFormRef = ref(null)

// 获取番剧列表
const getList = () => {
  loading.value = true
  getAnimeList(queryParams).then(({ data }) => {
    if (data.flag) {
      const result = data.data || {}
      animeList.value = result.list || []
      total.value = result.total || 0
    } else {
      ElMessage.error(data.msg || '获取番剧列表失败')
      animeList.value = []
      total.value = 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 获取平台标签类型
const getPlatformTagType = (platform) => {
  const platformMap = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return platformMap[platform] || 'info'
}

// 获取平台名称
const getPlatformLabel = (platform) => {
  const platformMap = {
    1: 'bilibili',
    2: '腾讯视频',
    3: '爱奇艺',
    4: '优酷'
  }
  return platformMap[platform] || '未知平台'
}

// 获取追番状态标签类型
const getWatchStatusTagType = (status) => {
  const statusMap = {
    1: 'info',
    2: 'warning',
    3: 'success'
  }
  return statusMap[status] || 'info'
}

// 获取追番状态名称
const getWatchStatusLabel = (status) => {
  const statusMap = {
    1: '想看',
    2: '在看',
    3: '已看'
  }
  return statusMap[status] || '未知状态'
}

// 表单重置
const reset = () => {
  form.id = undefined
  form.animeName = ''
  form.platform = 1
  form.animeId = ''
  form.animeStatus = 1
  form.watchStatus = 1
  
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  })
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增按钮操作
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加番剧'
}

// 查看按钮操作
const handleView = (row) => {
  Object.assign(viewForm, row)
  viewOpen.value = true
}

// 修改按钮操作
const handleUpdate = (row) => {
  reset()
  const id = row.id || ids.value[0]
  getAnimeDetail(id).then(({ data }) => {
    if (data.flag) {
      Object.assign(form, data.data)
      open.value = true
      title.value = '修改番剧'
    } else {
      ElMessage.error(data.msg || '获取番剧详情失败')
    }
  })
}

// 更新番剧信息按钮操作
const handleUpdateInfo = (row) => {
  ElMessageBox.confirm('确认更新该番剧信息?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    updateAnimeInfo(row.id).then(({ data }) => {
      if (data.flag) {
        ElMessage.success(data.msg || '更新成功')
        getList()
      } else {
        ElMessage.error(data.msg || '更新失败')
      }
    }).finally(() => {
      loading.value = false
    })
  }).catch(() => {})
}

// 运行更新任务
const handleRunTask = () => {
  ElMessageBox.confirm('确认运行更新所有番剧信息的任务?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    runUpdateTask().then(({ data }) => {
      if (data.flag) {
        ElMessage.success(data.msg || '任务已添加')
      } else {
        ElMessage.error(data.msg || '任务添加失败')
      }
    }).finally(() => {
      loading.value = false
    })
  }).catch(() => {})
}

// 提交按钮
const submitForm = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      if (form.id) {
        updateAnime(form.id, form).then(({ data }) => {
          if (data.flag) {
            ElMessage.success(data.msg || '修改成功')
            open.value = false
            getList()
          } else {
            ElMessage.error(data.msg || '修改失败')
          }
        }).finally(() => {
          loading.value = false
        })
      } else {
        addAnime(form).then(({ data }) => {
          if (data.flag) {
            ElMessage.success(data.msg || '新增成功')
            open.value = false
            getList()
          } else {
            ElMessage.error(data.msg || '新增失败')
          }
        }).finally(() => {
          loading.value = false
        })
      }
    }
  })
}

// 删除按钮操作
const handleDelete = (row) => {
  const deleteId = row.id || ids.value
  ElMessageBox.confirm('确认删除所选番剧?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    deleteAnime(deleteId).then(({ data }) => {
      if (data.flag) {
        ElMessage.success(data.msg || '删除成功')
        getList()
      } else {
        ElMessage.error(data.msg || '删除失败')
      }
    }).finally(() => {
      loading.value = false
    })
  }).catch(() => {})
}

// 取消按钮
const cancel = () => {
  open.value = false
}

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}
.table-toolbar {
  margin-bottom: 20px;
}
</style> 