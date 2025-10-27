import dayjs from 'dayjs'
//封装格式化日期函数
export const formatDate = (time) => dayjs(time).format('YYYY年MM月DD日')
