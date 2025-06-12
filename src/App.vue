<template>
  <v-container fluid>
    <v-row align="stretch" style="display: flex; height: 100%">
      <!-- 左边的灯光位置布局 -->
      <v-col cols="10">
        <LightLayout
          @selectedLights="handleLightSelected"
          :brightness="brightnessValue"
          class="LightLayout"
        />
      </v-col>

      <v-col cols="2">
        <v-card class="control-panel">
          <v-card-text>
            <div v-if="selectedLights.length > 0">
              <div class="slider-container">
                <input
                  v-model.number="brightnessValue"
                  type="number"
                  min="0"
                  max="225"
                  step="5"
                  class="slider-input"
                />

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
                />
              </div>

              <div class="control-panel-btn">
                <v-btn variant="outlined" @click="setAllFull">全部输出225</v-btn>
                <v-btn variant="outlined" @click="setAllZero" style="margin-top: 20px"
                  >全部输出0</v-btn
                >
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
import { ref, watch, computed } from 'vue'
import { throttle } from 'lodash'
import LightLayout from './components/LightLayout.vue'

const selectedLights = ref([])
const brightnessValue = ref(0)
const computedColor = computed(() => {
  const rgbValue = Math.round((brightnessValue.value / 225) * 255)
  return `rgb(19, ${rgbValue}, 77)`
})

const setAllFull = () => {
  brightnessValue.value = 225
}

const setAllZero = () => {
  brightnessValue.value = 0
}

const handleLightSelected = (lights) => {
  selectedLights.value = lights
  brightnessValue.value = lights[0].brightness
}

const sendBrightnessUpdate = async () => {
  if (selectedLights.value.length === 0) return
  const payload = {
    brightness: brightnessValue.value,
    dmxAddrList: selectedLights.value.map((light) => light.dmxAddr)
  }
  try {
    const response = await fetch('api/ArtNet/updateBrightness', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error('Failed to update brightness')
    }
    console.log('Brightness updated successfully')
  } catch (error) {
    console.error('Error updating brightness:', error)
  }
}

watch(
  brightnessValue,
  throttle((newValue) => {
    sendBrightnessUpdate()
  }, 1000)
)
</script>

<style scoped>
.LightLayout {
  margin-left: auto;
  width: 100%;
}

.slider-container {
  display: flex;
  flex-direction: column;
  align-content: center;
}

.slider-input {
  width: 80px;
  height: 32px;
  text-align: center;
  line-height: 56px;
  border: 1px gray solid;
  border-radius: 4px;
}

.control-panel {
  height: 100%;
  background-color: white; /* 可选：设置背景颜色 */
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); /* 可选：添加阴影 */
  padding: 20px;
}

.toggle-panel-btn {
  z-index: 110;
}

.v-btn {
  margin: 10px 0;
}
</style>
