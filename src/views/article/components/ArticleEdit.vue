<script setup>
import { ref } from 'vue'
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { articlePublishService, articleGetService, articleEditService } from '@/api/article'
import { baseURL } from '@/utils/request'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const visibileDrawer = ref(false)

// 默认数据
const defaultForm = {
  title: '', //标题
  cate_id: '', //分类id
  cover_img: '', //封面图片 flie对象
  content: '', //string内容
  state: '', //状态
}

// 准备数据
const formModel = ref({
  ...defaultForm,
})
// 图片上传逻辑
const imgUrl = ref('')
const onSelectFile = (uploadFile) => {
  // 预览图片
  imgUrl.value = URL.createObjectURL(uploadFile.raw)
  // 立刻将图片对象，存入 formModel.value.cover_img 将来用于提交
  formModel.value.cover_img = uploadFile.raw
}

// 提交
const emit = defineEmits(['success'])
const onPublish = async (state) => {
  // 将已发布还是草稿状态，存入formModel
  formModel.value.state = state

  //注意；当前接口，需要的是formModel对象
  //将普通对象 => 转换成 => formData对象
  const fd = new FormData()
  for (let key in formModel.value) {
    fd.append(key, formModel.value[key])
  }
  // 发请求
  if (formModel.value.id) {
    // 编辑操作
    await articleEditService(fd)
    ElMessage.success('修改成功')
    visibileDrawer.value = false
    emit('success', 'edit')
  } else {
    // 添加操作
    await articlePublishService(fd)
    ElMessage.success('添加成功')
    visibileDrawer.value = false
    // 通知到父组件，添加成功了
    emit('success', 'add')
  }
}
const editorRef = ref()
const open = async (row) => {
  visibileDrawer.value = true

  if (row.id) {
    // 需要基于 row.id 发送请求，获取编辑对应的详情数据，进行回显
    const res = await articleGetService(row.id)
    formModel.value = res.data.data
    // 回显封面图片
    imgUrl.value = baseURL + res.data.data.cover_img
    //注意： 提交给后台需要的数据格式是file对象格式
    //需要将网络图片地址转换成file对象存储起来
    const file = await urlToFile(imgUrl.value, formModel.value.cover_img)
    formModel.value.cover_img = file
  } else {
    formModel.value = {
      ...defaultForm,
    } // 基于默认的数据，重置form数据
    imgUrl.value = ''
    editorRef.value.setHTML('')
  }
}

async function urlToFile(url, fileName) {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
    })

    const blob = response.data
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime(),
    })

    return file
  } catch (error) {
    throw new Error('图片获取失败: ' + error.message)
  }
}

defineExpose({
  open,
})
</script>

<template>
  <el-drawer
    v-model="visibileDrawer"
    :title="formModel.id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form :model="formModel" ref="formRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <channel-select v-model="formModel.cate_id" width="100%"></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <!-- 此处需要关闭 element-plus 的自动上传，不需要配置action 等参数
         只需要做前端的本地预览图片即可，无需在提交前上传图标
         语法：URL.createObjectURL(...) 创建本地预览的地址，来预览 -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          auto-upload="false"
          :on-change="onSelectFile"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <quill-editor
            ref="editorRef"
            v-model:content="formModel.content"
            content-type="html"
            theme="snow"
          ></quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="onPublish('已发布')" type="primary">发布</el-button>
        <el-button @click="onPublish('草稿')" type="info">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style lang="scss" scoped>
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }
    .el-upload:hover {
      border-color: var(--el-color-primary);
    }
    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}
.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
