<script setup>
import { artGetChannelService } from '@/api/article.js'
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: [Number, String],
  },
})

const emit = defineEmits(['update:modelValue'])

const channelList = ref([])
const getChannelList = async () => {
  const res = await artGetChannelService()
  channelList.value = res.data.data
  console.log(channelList.value)
}
getChannelList()
</script>

<template>
  <el-select
    style="width: 280px"
    :modelValue="modelValue"
    @update:modelValue="emit('onUpdate:modelValue', $event)"
  >
    <el-option
      v-for="channel in channelList"
      :key="channel.id"
      :label="channel.cate_name"
      :value="channel.id"
      label="新闻"
      value="110"
    ></el-option>
    <el-option label="体育" value="137"></el-option>
  </el-select>
</template>
