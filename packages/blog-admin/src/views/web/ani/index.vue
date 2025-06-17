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
        <el-form-item label="地区" prop="area">
          <el-select v-model="queryParams.area" placeholder="请选择地区" clearable style="width: 200px">
            <el-option
              v-for="dict in areaOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
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
        <el-button
          type="warning"
          icon="Download"
          @click="showTencentImport = true"
          v-hasPerm="['blog:anime:add']"
        >从腾讯视频导入</el-button>
        <el-button
          type="danger"
          icon="Download"
          @click="showOtherImport = true"
          v-hasPerm="['blog:anime:add']"
        >其他平台导入</el-button>
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
        <el-table-column label="地区" prop="area" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getAreaTagType(scope.row.area)" style="margin: 0 2px;">
              {{ scope.row.area.name }}
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
            <template v-if="scope.row.platform === 1">
              {{ scope.row.currentEpisodes || 0 }}/{{ scope.row.totalEpisodes || '?' }}
            </template>
            <template v-else>
              {{ scope.row.totalEpisodes || '?' }}集
            </template>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" min-width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.lastUpdateTime || scope.row.updateTime) }}</span>
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
        v-model:page="queryParams.page"
        v-model:limit="queryParams.limit"
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
          <el-radio-group v-model="form.platform">
            <el-radio 
              v-for="dict in platformOptions"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- bilibili平台特有字段 -->
        <template v-if="form.platform === 1">
          <el-form-item label="番剧ID" prop="animeId">
            <el-input v-model="form.animeId" placeholder="请输入B站番剧ID" />
          </el-form-item>
        </template>
        
        <!-- 腾讯视频平台特有字段 -->
        <template v-if="form.platform === 2">
          <el-form-item label="番剧ID" prop="animeId">
            <el-input v-model="form.animeId" placeholder="请输入腾讯视频番剧ID" />
          </el-form-item>
          <el-form-item label="评分" prop="rating">
            <el-input v-model="form.rating" placeholder="请输入评分(0-10)" maxlength="3">
              <template #append>分</template>
            </el-input>
          </el-form-item>
          <el-form-item label="番剧状态" prop="animeStatus">
            <el-radio-group v-model="form.animeStatus">
              <el-radio 
                v-for="dict in animeStatusOptions"
                :key="dict.value"
                :value="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="地区" prop="area">
            <el-select v-model="form.area" placeholder="请选择地区">
              <el-option
                v-for="dict in areaOptions"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="总集数" prop="totalEpisodes">
            <el-input v-model="form.totalEpisodes" placeholder="请输入总集数" maxlength="4">
              <template #append>集</template>
            </el-input>
          </el-form-item>
        </template>
        
        <!-- 爱奇艺和优酷平台纯静态输入表单 -->
        <template v-if="form.platform === 3 || form.platform === 4">
          <el-form-item label="评分" prop="rating">
            <el-input v-model="form.rating" placeholder="请输入评分(0-10)" maxlength="3">
              <template #append>分</template>
            </el-input>
          </el-form-item>
          <el-form-item label="番剧状态" prop="animeStatus">
            <el-radio-group v-model="form.animeStatus">
              <el-radio 
                v-for="dict in animeStatusOptions"
                :key="dict.value"
                :value="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="总集数" prop="totalEpisodes">
            <el-input v-model="form.totalEpisodes" placeholder="请输入总集数" maxlength="4">
              <template #append>集</template>
            </el-input>
          </el-form-item>
          <el-form-item label="视频链接" prop="link">
            <el-input v-model="form.link" placeholder="请输入视频链接，如：https://www.iqiyi.com/v_19rr7pi4k4.html" />
          </el-form-item>
          <el-form-item label="简介" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入番剧简介" />
          </el-form-item>
          <el-form-item label="配音演员" prop="actors">
            <el-input v-model="form.actors" placeholder="请输入配音演员，多个用逗号分隔" />
          </el-form-item>
          <el-form-item label="地区" prop="area">
            <el-select v-model="form.area" placeholder="请选择地区">
              <el-option
                v-for="dict in areaOptions"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间" prop="publishTime">
            <el-input v-model="form.publishTime" placeholder="请输入发布时间，如：2023" />
          </el-form-item>
          <el-form-item label="类型标签" prop="styles">
            <el-input v-model="form.stylesInput" placeholder="请输入类型标签，多个用逗号分隔" />
          </el-form-item>
        </template>
        
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
          <template v-if="viewForm.platform === 1">
            {{ viewForm.currentEpisodes || 0 }}/{{ viewForm.totalEpisodes || '?' }}
          </template>
          <template v-else>
            {{ viewForm.totalEpisodes || '?' }}集
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" label-align="right" align="left">
          {{ formatDateTime(viewForm.lastUpdateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="视频链接" label-align="right" align="left" v-if="viewForm.link">
          <a :href="viewForm.link" target="_blank">{{ viewForm.link }}</a>
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

    <!-- 从腾讯视频导入对话框 -->
    <el-dialog title="从腾讯视频导入" v-model="showTencentImport" width="600px" append-to-body>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        bilibili接口已开放权限可以实时更新番剧信息，而其他视频平台接口采取了反爬虫措施，可获取的有效数据有限，目前暂时无法实现数据的实时同步更新，因此采用静态数据展示。
      </el-alert>
      <el-form ref="tencentImportFormRef" :model="tencentImportForm" :rules="tencentImportRules" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="腾讯视频ID" prop="animeId">
          <el-input v-model="tencentImportForm.animeId" placeholder="请输入腾讯视频番剧ID（如：m441e3rjq9kwpsc）" />
        </el-form-item>
        <el-form-item label="番剧状态" prop="animeStatus">
          <el-radio-group v-model="tencentImportForm.animeStatus">
            <el-radio 
              v-for="dict in animeStatusOptions"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="追番状态" prop="watchStatus">
          <el-select v-model="tencentImportForm.watchStatus" placeholder="请选择追番状态">
            <el-option
              v-for="dict in watchStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input v-model="tencentImportForm.rating" placeholder="请输入评分(0-10)" maxlength="3">
            <template #append>分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="总集数" prop="totalEpisodes">
          <el-input v-model="tencentImportForm.totalEpisodes" placeholder="请输入总集数" maxlength="4">
            <template #append>集</template>
          </el-input>
        </el-form-item>
        <el-form-item label="使用自定义封面">
          <el-switch v-model="tencentImportForm.useCustomCover" />
        </el-form-item>
        <el-form-item label="自定义封面" v-if="tencentImportForm.useCustomCover" prop="customCover">
          <el-upload
            drag
            :show-file-list="false"
            :headers="authorization"
            :action="baseURL + '/anime/upload-cover'"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-success="handleTencentCoverSuccess"
          >
            <el-icon class="el-icon--upload" v-if="!tencentImportForm.customCover"><upload-filled /></el-icon>
            <div class="el-upload__text" v-if="!tencentImportForm.customCover">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <img v-else :src="tencentImportForm.customCover" width="200" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTencentImport = false">取 消</el-button>
          <el-button type="primary" @click="handleTencentImport" :loading="tencentImportLoading">导 入</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 其他平台导入对话框 -->
    <el-dialog title="其他平台导入" v-model="showOtherImport" width="600px" append-to-body>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        爱奇艺和优酷等平台接口采取了严格的反爬虫措施，目前只能采用纯静态数据录入方式，无法实现自动更新。
      </el-alert>
      <el-form ref="otherImportFormRef" :model="otherImportForm" :rules="otherImportRules" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="番剧名称" prop="animeName">
          <el-input v-model="otherImportForm.animeName" placeholder="请输入番剧名称" />
        </el-form-item>
        <el-form-item label="番剧平台" prop="platform">
          <el-radio-group v-model="otherImportForm.platform">
            <el-radio :value="3">爱奇艺</el-radio>
            <el-radio :value="4">优酷</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="番剧状态" prop="animeStatus">
          <el-radio-group v-model="otherImportForm.animeStatus">
            <el-radio 
              v-for="dict in animeStatusOptions"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="追番状态" prop="watchStatus">
          <el-select v-model="otherImportForm.watchStatus" placeholder="请选择追番状态">
            <el-option
              v-for="dict in watchStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input v-model="otherImportForm.rating" placeholder="请输入评分(0-10)" maxlength="3">
            <template #append>分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="总集数" prop="totalEpisodes">
          <el-input v-model="otherImportForm.totalEpisodes" placeholder="请输入总集数" maxlength="4">
            <template #append>集</template>
          </el-input>
        </el-form-item>
        <el-form-item label="视频链接" prop="link">
          <el-input v-model="otherImportForm.link" placeholder="请输入视频链接，如：https://www.iqiyi.com/v_19rr7pi4k4.html" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="otherImportForm.description" type="textarea" :rows="4" placeholder="请输入番剧简介" />
        </el-form-item>
        <el-form-item label="配音演员" prop="actors">
          <el-input v-model="otherImportForm.actors" placeholder="请输入配音演员，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="地区" prop="area">
          <el-select v-model="otherImportForm.area" placeholder="请选择地区">
            <el-option
              v-for="dict in areaOptions"
              :key="dict.id"
              :label="dict.name"
              :value="dict"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-input v-model="otherImportForm.publishTime" placeholder="请输入发布时间，如：2023" />
        </el-form-item>
        <el-form-item label="类型标签" prop="styles">
          <el-input v-model="otherImportForm.stylesInput" placeholder="请输入类型标签，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            drag
            :show-file-list="false"
            :headers="authorization"
            :action="baseURL + '/anime/upload-cover'"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-success="handleOtherCoverSuccess"
          >
            <el-icon class="el-icon--upload" v-if="!otherImportForm.cover"><upload-filled /></el-icon>
            <div class="el-upload__text" v-if="!otherImportForm.cover">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <img v-else :src="otherImportForm.cover" width="200" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showOtherImport = false">取 消</el-button>
          <el-button type="primary" @click="handleOtherImport" :loading="otherImportLoading">导 入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnimeList, getAnimeDetail, addAnime, updateAnime, deleteAnime, updateAnimeInfo, runUpdateTask, importFromBilibili, importFromTencent } from '@/api/anime'
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
// 是否显示从腾讯视频导入对话框
const showTencentImport = ref(false)
// 是否显示其他平台导入对话框
const showOtherImport = ref(false)
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
  description: '',
  link: ''
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
  watchStatus: undefined,
  area: undefined
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
  ],
  rating: [
    { pattern: /^([0-9]|10)(\.[0-9])?$/, message: '评分必须是0-10之间的数字，最多一位小数', trigger: 'blur' }
  ],
  totalEpisodes: [
    { pattern: /^[1-9]\d{0,3}$/, message: '总集数必须是1-9999之间的正整数', trigger: 'blur' }
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

// 地区选项
const areaOptions = [
  { id: 1, name: '国漫' },
  { id: 2, name: '日漫' },
  { id: 3, name: '美漫' }
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

const getAreaTagType = (area) => {
  const areaMap = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }

  return areaMap[area.id] || 'info'
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
  // 添加腾讯视频相关字段的初始化
  form.rating = undefined
  form.animeStatus = 1
  form.totalEpisodes = undefined
  // 添加爱奇艺和优酷平台相关字段的初始化
  form.description = ''
  form.actors = ''
  form.area = undefined
  form.publishTime = ''
  form.stylesInput = ''
  form.link = ''
  
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
      
      // 处理styles字段
      if (form.platform === 3 || form.platform === 4) {
        if (form.stylesInput) {
          submitData.styles = form.stylesInput.split(',').map(item => item.trim());
          delete submitData.stylesInput;
        }
      }
      
      // 确保评分和总集数是数字类型
      if (submitData.rating) {
        submitData.rating = parseFloat(submitData.rating);
      }
      
      if (submitData.totalEpisodes) {
        submitData.totalEpisodes = parseInt(submitData.totalEpisodes);
      }

      if(submitData.area) {
        submitData.area = areaOptions.find(item => item.id === submitData.area);
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

// 腾讯视频导入表单
const tencentImportForm = reactive({
  animeId: '',
  animeStatus: 1,
  watchStatus: 1,
  rating: undefined,
  totalEpisodes: undefined,
  useCustomCover: false,
  customCover: ''
})

// 腾讯视频导入表单校验规则
const tencentImportRules = {
  animeId: [
    { required: true, message: '腾讯视频番剧ID不能为空', trigger: 'blur' }
  ],
  animeStatus: [
    { required: true, message: '番剧状态不能为空', trigger: 'change' }
  ],
  watchStatus: [
    { required: true, message: '追番状态不能为空', trigger: 'change' }
  ],
  rating: [
    { pattern: /^([0-9]|10)(\.[0-9])?$/, message: '评分必须是0-10之间的数字，最多一位小数', trigger: 'blur' }
  ],
  totalEpisodes: [
    { pattern: /^[1-9]\d{0,3}$/, message: '总集数必须是1-9999之间的正整数', trigger: 'blur' }
  ]
}

// 腾讯视频导入表单ref
const tencentImportFormRef = ref(null)

// 腾讯视频导入加载状态
const tencentImportLoading = ref(false)

// 处理腾讯视频封面上传成功
const handleTencentCoverSuccess = (response) => {
  if (response.code === 200) {
    tencentImportForm.customCover = response.data;
    ElMessage.success('自定义封面上传成功');
  } else {
    ElMessage.error(response.message || '自定义封面上传失败');
  }
};

// 处理从腾讯视频导入
const handleTencentImport = () => {
  tencentImportFormRef.value.validate((valid) => {
    if (valid) {
      tencentImportLoading.value = true;
      
      const importData = {
        animeId: tencentImportForm.animeId,
        animeStatus: tencentImportForm.animeStatus,
        watchStatus: tencentImportForm.watchStatus,
        rating: tencentImportForm.rating ? parseFloat(tencentImportForm.rating) : undefined,
        totalEpisodes: tencentImportForm.totalEpisodes ? parseInt(tencentImportForm.totalEpisodes) : undefined,
        customCover: tencentImportForm.useCustomCover ? tencentImportForm.customCover : undefined
      };
      
      importFromTencent(importData).then(({ data }) => {
        if (data.code === 200) {
          ElMessage.success(data.message || '导入成功');
          showTencentImport.value = false;
          // 重置导入表单
          tencentImportForm.animeId = '';
          tencentImportForm.animeStatus = 1;
          tencentImportForm.watchStatus = 1;
          tencentImportForm.rating = undefined;
          tencentImportForm.totalEpisodes = undefined;
          tencentImportForm.useCustomCover = false;
          tencentImportForm.customCover = '';
          getList(); // 刷新列表
        } else {
          ElMessage.error(data.message || '导入失败');
        }
      }).catch(() => {
        ElMessage.error('导入失败，请稍后重试');
      }).finally(() => {
        tencentImportLoading.value = false;
      });
    } else {
      ElMessage.error('表单验证失败');
    }
  });
}

// 其他平台导入表单
const otherImportForm = reactive({
  animeName: '',
  platform: 3,
  animeStatus: 1,
  watchStatus: 1,
  rating: undefined,
  totalEpisodes: undefined,
  description: '',
  actors: '',
  area: 1,
  publishTime: '',
  stylesInput: '',
  cover: '',
  link: ''
})

// 其他平台导入表单校验规则
const otherImportRules = {
  animeName: [
    { required: true, message: '番剧名称不能为空', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '番剧平台不能为空', trigger: 'change' }
  ],
  animeStatus: [
    { required: true, message: '番剧状态不能为空', trigger: 'change' }
  ],
  watchStatus: [
    { required: true, message: '追番状态不能为空', trigger: 'change' }
  ],
  rating: [
    { pattern: /^([0-9]|10)(\.[0-9])?$/, message: '评分必须是0-10之间的数字，最多一位小数', trigger: 'blur' }
  ],
  totalEpisodes: [
    { pattern: /^[1-9]\d{0,3}$/, message: '总集数必须是1-9999之间的正整数', trigger: 'blur' }
  ]
}

// 其他平台导入表单ref
const otherImportFormRef = ref(null)

// 其他平台导入加载状态
const otherImportLoading = ref(false)

// 处理其他平台封面上传成功
const handleOtherCoverSuccess = (response) => {
  if (response.code === 200) {
    otherImportForm.cover = response.data;
    ElMessage.success('封面上传成功');
  } else {
    ElMessage.error(response.message || '封面上传失败');
  }
};

// 处理其他平台导入
const handleOtherImport = () => {
  otherImportFormRef.value.validate((valid) => {
    if (valid) {
      otherImportLoading.value = true;
      
      const importData = {
        animeName: otherImportForm.animeName,
        platform: otherImportForm.platform,
        animeStatus: otherImportForm.animeStatus,
        watchStatus: otherImportForm.watchStatus,
        rating: otherImportForm.rating ? parseFloat(otherImportForm.rating) : undefined,
        totalEpisodes: otherImportForm.totalEpisodes ? parseInt(otherImportForm.totalEpisodes) : undefined,
        description: otherImportForm.description,
        actors: otherImportForm.actors,
        area: otherImportForm.area,
        publishTime: otherImportForm.publishTime,
        styles: otherImportForm.stylesInput ? otherImportForm.stylesInput.split(',').map(item => item.trim()) : [],
        cover: otherImportForm.cover,
        link: otherImportForm.link
      };
      
      // 处理styles字段
      if (importData.styles.length === 0) {
        delete importData.styles;
      }
      
      addAnime(importData).then(({ data }) => {
        if (data.flag) {
          ElMessage.success(data.msg || '导入成功');
          showOtherImport.value = false;
          // 重置导入表单
          otherImportForm.animeName = '';
          otherImportForm.platform = 3;
          otherImportForm.animeStatus = 1;
          otherImportForm.watchStatus = 1;
          otherImportForm.rating = undefined;
          otherImportForm.totalEpisodes = undefined;
          otherImportForm.description = '';
          otherImportForm.actors = '';
          otherImportForm.area = undefined;
          otherImportForm.publishTime = '';
          otherImportForm.stylesInput = '';
          otherImportForm.cover = '';
          otherImportForm.link = '';
          getList(); // 刷新列表
        } else {
          ElMessage.error(data.message || '导入失败');
        }
      }).catch(() => {
        ElMessage.error('导入失败，请稍后重试');
      }).finally(() => {
        otherImportLoading.value = false;
      });
    } else {
      ElMessage.error('表单验证失败');
    }
  });
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