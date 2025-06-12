<template>
    <v-container fluid >
      <v-row   align="stretch" style="display: flex; height: 100%;">
        <!-- 左边的灯光位置布局 -->
        <v-col cols="10" >
          <LightLayout  
          @selectedLights="handleLightSelected" 
          :brightness="brightnessValue"
          class="LightLayout"
       />
        </v-col>
        <!-- 右边的控制面板 -->
        <v-col cols="2" class="v-col" style="width: min-content;">
          <v-card style="width:fit-content;height: 100%;display: flex; align-items: center;">
            <!-- <v-card-title>控制面板</v-card-title> -->
            <v-card-text  >
              <!-- <p>{{ selectedLights }}</p> -->
              <div v-if="selectedLights.length > 0">
                <!-- <p v-for="light in selectedLights" :key="light">控制灯光 {{ light.id }}</p> -->
                <div class="slider-container">
                  <input
                    v-model.number="brightnessValue"
                    type="number"
                    min="0"
                    max="225"
                    step="5"
                    style="margin: auto 25px auto  auto ;
                    margin-bottom: 20px;"
                    class="slider-input">
                  </input>
                  <!-- v-slider 控制亮度 -->
                  
                  <v-slider
                    v-model="brightnessValue"
                    track-color="rgba(19, 211, 77, 0.434)"
                    :color="computedColor"
                    min="0"
                    max="225"
                    label="亮度"
                    step="2"
                    direction="vertical"
                    thumb-label
                  ></v-slider>
  
                  <!-- 输入框用于控制 dmxValue -->
                  
                </div>
                <div class="control-panel-btn" style="display: flex; flex-direction: column; justify-content: space-between;" >
                <v-btn variant="outlined" @click="setAllFull" style="margin: 10px,0,10px,0;">全部输出225</v-btn>
                <v-btn variant="outlined" @click="setAllZero" style="margin: 10px,0,10px,0; margin-top: 20px;">全部输出 0</v-btn>
              </div>
              </div>
              <div v-else>
                <p>请选择灯光</p>
              </div>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref,watch,computed  } from 'vue'
  import { throttle } from 'lodash';
  import LightLayout from './components/LightLayout.vue'
  
  const selectedLights = ref([])
  const brightnessValue = ref(0)
  const computedColor = computed(() => {
    // 将 brightnessValue 转换为 RGB 值（0-100 的范围映射到 0-255）
    const rgbValue = Math.round((brightnessValue.value / 225) * 255)
    // 生成颜色字符串
    return `rgb(${19}, ${rgbValue}, ${77})`
  })
  const setAllFull = () => {
    brightnessValue.value = 0
    brightnessValue.value = 225
  }
  const setAllZero = () => {
    brightnessValue.value = 225
    brightnessValue.value = 0
  }
  
  const handleLightSelected = (lights) => {
    selectedLights.value = lights
    brightnessValue.value=lights[0].brightness
  }
  
  // const updateBrightness = (newBrightness) => {
  
  //   selectedLights.value.forEach(l => {
  //     console.log("dmxAddr:"+l.dmxAddr+"\nbrightness:"+newBrightness)
  //   });
  // }
  
  const sendBrightnessUpdate = async () => {
    if (selectedLights.value.length === 0) return;
    const payload = {
      brightness: brightnessValue.value,
      dmxAddrList: selectedLights.value.map(light => light.dmxAddr),
    };
    try {
      const response = await fetch('api/ArtNet/updateBrightness', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to update brightness');
      }
      console.log('Brightness updated successfully');
    } catch (error) {
      console.error('Error updating brightness:', error);
    }
  };
  // 监听 brightnessValue 的变化
  watch(brightnessValue, throttle((newValue) => {
    // 更新选中的灯光亮度
  //  updateBrightness(newValue)
   sendBrightnessUpdate()
  
  },1000))
  
  // onMounted(() => {
  //   // 每秒发送 5 次请求
  //   intervalId = setInterval(() => {
  //     sendBrightnessUpdate();
  //   }, 500); // 200 毫秒间隔
  // });
  // onBeforeUnmount(() => {
  //   // 清除定时器
  //   if (intervalId) {
  //     clearInterval(intervalId);
  //   }
  // });
  
  </script>
  <style>
  .LightLayout{
    margin-left: auto;
    width: min-content;
  }
  .slider-container {
    display: flex;
    flex-direction: column;
    align-content: center;
  }
  
  .slider-vertical {
    height: 200px; /* 可以根据需要调整高度 */
    margin: 0 auto; /* 居中 */
  }
  
  .slider-input {
    width: 80px; /* 输入框宽度 */
    height: 32px; /* 输入框高度，与滑块一致 */
    text-align: center; /* 文本居中 */
    line-height: 56px; /* 确保文本垂直居中 */
    border: 1px gray solid ;
    border-radius:4px ;
  }
  
  .slider-input input {
    height: 100%; /* 确保输入框内文本的高度 */
  }
  </style>
  