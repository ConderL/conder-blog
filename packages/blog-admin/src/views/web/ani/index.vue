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
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card shadow="never">
      <div class="table-toolbar">
        <el-button
          type="primary"
          icon="Plus"
          @click="handleAdd"
          v-hasPerm="['blog:anime:add']"
        >新增</el-button>
        <el-button
          type="success"
          icon="Refresh"
          @click="handleRunTask"
          v-hasPerm="['blog:anime:update']"
        >更新所有番剧信息</el-button>
        <el-button
          type="info"
          icon="Download"
          @click="showBilibiliImport = true"
          v-hasPerm="['blog:anime:add']"
        >从B站导入</el-button>
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
            <img :src="scope.row.cover" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
          </template>
        </el-table-column>
        <el-table-column label="番剧名称" prop="animeName" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="番剧平台" align="center" width="100">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(scope.row.platform)" style="margin: 0 2px;">
              {{ getPlatformLabel(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="番剧ID" prop="animeId" width="100" align="center" />
        <el-table-column label="番剧状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.animeStatus === 1 ? 'warning' : 'success'" style="margin: 0 2px;">
              {{ scope.row.animeStatus === 1 ? '连载中' : '已完结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="追番状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="getWatchStatusTagType(scope.row.watchStatus)" style="margin: 0 2px;">
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
        <el-table-column label="更新时间" align="center" min-width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.lastUpdateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="250">
          <template #default="scope">
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
              <el-button
                size="small"
                type="primary"
                text
                icon="View"
                @click="handleView(scope.row)"
              >查看</el-button>
              <el-button
                size="small"
                type="primary"
                text
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPerm="['blog:anime:edit']"
              >编辑</el-button>
              <el-button
                size="small"
                type="primary"
                text
                icon="Refresh"
                @click="handleUpdateInfo(scope.row)"
                v-hasPerm="['blog:anime:update']"
              >更新信息</el-button>
              <el-button
                size="small"
                type="danger"
                text
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPerm="['blog:anime:remove']"
              >删除</el-button>
            </div>
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
        <el-form-item label="番剧封面" prop="cover">
          <el-upload
            drag
            :show-file-list="false"
            :headers="authorization"
            :action="baseURL + '/anime/upload-cover'"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-success="handleCoverSuccess"
          >
            <el-icon class="el-icon--upload" v-if="!form.cover"><upload-filled /></el-icon>
            <div class="el-upload__text" v-if="!form.cover">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <img v-else :src="form.cover" width="200" />
          </el-upload>
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
        <el-descriptions-item label="番剧名称" label-align="right" align="left">{{ viewForm.animeName }}</el-descriptions-item>
        <el-descriptions-item label="番剧平台" label-align="right" align="left">{{ getPlatformLabel(viewForm.platform) }}</el-descriptions-item>
        <el-descriptions-item label="番剧ID" label-align="right" align="left">{{ viewForm.animeId }}</el-descriptions-item>
        <el-descriptions-item label="番剧状态" label-align="right" align="left">
          <el-tag :type="viewForm.animeStatus === 1 ? 'warning' : 'success'">
            {{ viewForm.animeStatus === 1 ? '连载中' : '已完结' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="追番状态" label-align="right" align="left">
          <el-tag :type="getWatchStatusTagType(viewForm.watchStatus)">
            {{ getWatchStatusLabel(viewForm.watchStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评分" label-align="right" align="left">{{ viewForm.rating || '暂无评分' }}</el-descriptions-item>
        <el-descriptions-item label="集数" label-align="right" align="left">
          {{ viewForm.currentEpisodes || 0 }}/{{ viewForm.totalEpisodes || '?' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" label-align="right" align="left">
          {{ formatDateTime(viewForm.lastUpdateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="封面" :span="2" label-align="right" align="left">
          <img v-if="viewForm.cover" :src="viewForm.cover" style="max-width: 200px; max-height: 200px; border-radius: 4px;" />
          <span v-else>暂无封面</span>
        </el-descriptions-item>
        <el-descriptions-item label="简介" :span="2" label-align="right" align="left">
          {{ viewForm.description || '暂无简介' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 从B站导入对话框 -->
    <el-dialog title="从B站导入" v-model="showBilibiliImport" width="600px" append-to-body>
      <el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="100px">
        <el-form-item label="B站番剧ID" prop="bilibiliId">
          <el-input v-model="importForm.bilibiliId" placeholder="请输入B站番剧ID（如：md28232401、ss36442、ep400002中的数字部分）" />
        </el-form-item>
        <el-form-item label="追番状态" prop="watchStatus">
          <el-select v-model="importForm.watchStatus" placeholder="请选择追番状态">
            <el-option
              v-for="dict in watchStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用自定义封面">
          <el-switch v-model="importForm.useCustomCover" />
        </el-form-item>
        <el-form-item label="自定义封面" v-if="importForm.useCustomCover" prop="customCover">
          <el-upload
            drag
            :show-file-list="false"
            :headers="authorization"
            :action="baseURL + '/anime/upload-cover'"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-success="handleImportCoverSuccess"
          >
            <el-icon class="el-icon--upload" v-if="!importForm.customCover"><upload-filled /></el-icon>
            <div class="el-upload__text" v-if="!importForm.customCover">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <img v-else :src="importForm.customCover" width="200" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBilibiliImport = false">取 消</el-button>
          <el-button type="primary" @click="handleBilibiliImport" :loading="importLoading">导 入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnimeList, getAnimeDetail, addAnime, updateAnime, deleteAnime, updateAnimeInfo, runUpdateTask, importFromBilibili } from '@/api/anime'
import { formatDateTime } from "@/utils/date"
import { getToken, token_prefix } from "@/utils/token"
import { UploadRawFile } from "element-plus"
import * as imageConversion from "image-conversion"
import { getBaseURL } from "@/utils/request"
import { UploadFilled } from '@element-plus/icons-vue'

const baseURL = getBaseURL()

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
// 是否显示从B站导入对话框
const showBilibiliImport = ref(false)
// 导入表单
const importForm = reactive({
  bilibiliId: '',
  watchStatus: 1,
  useCustomCover: false,
  customCover: ''
})
// 导入表单校验
const importRules = {
  bilibiliId: [
    { required: true, message: 'B站番剧ID不能为空', trigger: 'blur' }
  ],
  watchStatus: [
    { required: true, message: '追番状态不能为空', trigger: 'change' }
  ]
}
// 导入表单ref
const importFormRef = ref(null)
// 导入表单加载状态
const importLoading = ref(false)

// Authorization 请求头
const authorization = computed(() => {
  return {
    Authorization: token_prefix + getToken(),
  };
})

// 表单参数
const form = reactive({
  id: undefined,
  animeName: '',
  platform: 1,
  animeId: '',
  watchStatus: 1,
  cover: ''
})

// 查看详情表单
const viewForm = reactive({
  id: undefined,
  animeName: '',
  platform: undefined,
  animeId: '',
  watchStatus: undefined,
  cover: '',
  rating: undefined,
  totalEpisodes: undefined,
  currentEpisodes: undefined,
  lastUpdateTime: undefined,
  description: ''
})

// 上传前处理
const beforeUpload = (rawFile: UploadRawFile) => {
  return new Promise((resolve) => {
    if (rawFile.size / 1024 < 200) {
      resolve(rawFile);
    }
    // 压缩到200KB,这里的200就是要压缩的大小,可自定义
    imageConversion.compressAccurately(rawFile, 200).then((res) => {
      resolve(res);
    });
  });
};

// 上传成功处理
const handleCoverSuccess = (response) => {
  if (response.code === 200) {
    form.cover = response.data;
    ElMessage.success('封面上传成功');
  } else {
    ElMessage.error(response.message || '封面上传失败');
  }
};

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
  form.watchStatus = 1
  form.cover = ''
  
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
      
      // 创建一个不包含 details 字段的数据对象
      const submitData = { ...form };
      if (submitData.details) {
        delete submitData.details;
      }
      
      if (form.id) {
        updateAnime(form.id, submitData).then(({ data }) => {
          if (data.code === 200) {
            ElMessage.success(data.message || '修改成功')
            open.value = false
            getList()
          } else {
            ElMessage.error(data.message || '修改失败')
          }
        }).finally(() => {
          loading.value = false
        })
      } else {
        addAnime(submitData).then(({ data }) => {
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

// 处理从B站导入
const handleBilibiliImport = () => {
  importFormRef.value.validate((valid) => {
    if (valid) {
      importLoading.value = true
      
      const importData = {
        animeId: importForm.bilibiliId,
        watchStatus: importForm.watchStatus,
        customCover: importForm.useCustomCover ? importForm.customCover : undefined
      }
      
      importFromBilibili(importData).then(({ data }) => {
        if (data.code === 200) {
          ElMessage.success(data.message || '导入成功')
          showBilibiliImport.value = false
          // 重置导入表单
          importForm.bilibiliId = ''
          importForm.watchStatus = 1
          importForm.useCustomCover = false
          importForm.customCover = ''
          getList() // 刷新列表
        } else {
          ElMessage.error(data.message || '导入失败')
        }
      }).catch(() => {
        ElMessage.error('导入失败，请稍后重试')
      }).finally(() => {
        importLoading.value = false
      })
    } else {
      ElMessage.error('表单验证失败')
    }
  })
}

// 处理导入封面
const handleImportCoverSuccess = (response) => {
  if (response.code === 200) {
    importForm.customCover = response.data;
    ElMessage.success('自定义封面上传成功');
  } else {
    ElMessage.error(response.message || '自定义封面上传失败');
  }
}
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}
.table-toolbar {
  margin-bottom: 20px;
}

/* 确保表格内容不会挤在一起 */
:deep(.el-table) {
  width: 100%;
  table-layout: fixed;
}

:deep(.el-table .cell) {
  word-break: break-word;
  padding: 8px;
  line-height: 1.5;
}

/* 确保标签有足够的空间 */
:deep(.el-tag) {
  margin: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  line-height: 22px;
}

/* 操作按钮样式 */
:deep(.el-button--text) {
  margin: 0 4px;
}

/* 详情对话框样式 */
:deep(.el-descriptions__label) {
  width: 120px;
  text-align: right;
}
</style> 