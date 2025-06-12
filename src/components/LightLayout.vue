<template>
  <v-card class="card">
    <v-card-title class="v-card-actions" style="justify-content: center">
      <h1>灯光面板</h1>
      <v-card-actions>
        <v-btn
          variant="outlined"
          @click="setMode('single')"
          :class="{ 'selected-mode': isMultiSelect === 'single' }"
          class="mode-control-btn"
          >单选模式</v-btn
        >
        <v-btn
          variant="outlined"
          @click="setMode('multi')"
          :class="{ 'selected-mode': isMultiSelect === 'multi' }"
          class="mode-control-btn"
          >多选模式</v-btn
        >
        <v-btn variant="outlined" @click="selectAll" class="mode-control-btn">全选</v-btn>
        <v-btn variant="outlined" @click="deselectAll" class="mode-control-btn">全不选</v-btn>
      </v-card-actions>
    </v-card-title>
    <v-card-text class="light-layout-container">
      <div class="grid">
        <!-- 行全选按钮 -->
        <v-btn
          v-for="row in 6"
          :key="'row-' + row"
          @click="selectRow(row - 1)"
          class="control-btn-left"
          :style="{ gridColumn: 1, gridRow: row + 1 }"
        >
          ➡️
        </v-btn>
        <!-- 列全选按钮 -->
        <v-btn
          v-for="col in 6"
          :key="'col-' + col"
          @click="selectCol(col - 1)"
          class="control-btn"
          :style="{ gridRow: 1, gridColumn: col + 1 }"
        >
          ⬇️
        </v-btn>

        <!-- 灯光按钮 -->
        <v-btn
          v-for="(light, index) in lights"
          :key="light.id"
          :class="{ selected: selectedLights.includes(light), broken: light.isBroken }"
          @click="toggleLightSelection(light)"
          :style="{
            width: buttonSize + 'px',
            height: buttonSize + 'px',
            gridColumn: (index % 6) + 2,
            gridRow: Math.floor(index / 6) + 2
          }"
        >
          <div
            class="brightness-indicator"
            :style="{ height: light.brightness / 2.25 + '%' }"
          ></div>
          <div class="light-info">
            <div>灯光 {{ light.id }}</div>
            <div>亮度: {{ light.brightness }}</div>
          </div>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
const emit = defineEmits(['selectedLights'])
const props = defineProps({
  brightness: Number
})

class LightLayout {
  constructor(id, brightness, dmxAddr, isBroken) {
    this.id = id
    this.brightness = brightness
    this.dmxAddr = dmxAddr
    this.isBroken = isBroken
  }
}

const lights = ref([])
const selectedLights = ref([])
const isMultiSelect = ref('single') // 切换单选/多选模式
const buttonSize = ref(80)

const toggleLightSelection = (light) => {
  if (isMultiSelect.value === 'single') {
    selectedLights.value = [light]
  } else {
    if (selectedLights.value.includes(light)) {
      selectedLights.value = selectedLights.value.filter((l) => l !== light)
    } else {
      selectedLights.value.push(light)
    }
  }

  emit('selectedLights', selectedLights.value)
}

const updateBrightnessInLights = (newBrightness) => {
  selectedLights.value.forEach((light) => {
    light.brightness = newBrightness
  })
}

watch(
  () => props.brightness,
  (newBrightness) => {
    updateBrightnessInLights(newBrightness)
  }
)

const fetchData = async () => {
  try {
    const lightsResponse = await fetch('api/ArtNet/lights')
    if (!lightsResponse.ok) {
      throw new Error('Network response was not ok')
    }

    const rawData = await lightsResponse.json()
    lights.value = rawData.map(
      (light) => new LightLayout(light.id, light.brightness, light.dmxAddress, light.status !== '0')
    )
  } catch (error) {
    alert(`Failed to fetch data: ${error}`)
  }
}

onMounted(() => {
  fetchData()
})

const selectRow = (row) => {
  selectedLights.value = []
  const rowCount = 6
  const startIdx = row * rowCount
  const endIdx = startIdx + rowCount
  selectedLights.value = lights.value.slice(startIdx, endIdx)
  emit('selectedLights', selectedLights.value)
}

const selectCol = (col) => {
  selectedLights.value = []
  const colCount = 6
  selectedLights.value = lights.value.filter((_, idx) => idx % colCount === col)
  emit('selectedLights', selectedLights.value)
}
const setMode = (mode) => {
  isMultiSelect.value = mode
}

const selectAll = () => {
  selectedLights.value = lights.value.slice() // 选择所有灯光
  emit('selectedLights', selectedLights.value)
}

const deselectAll = () => {
  selectedLights.value = [] // 清空选择
  emit('selectedLights', selectedLights.value)
}
</script>

<style scoped>
.v-card-actions {
  display: flex;
}
.mode-control-btn {
  font-size: 14px;
  padding: 8px 16px;
  padding-left: auto;
  margin: 0;
}
.selected-mode {
  background-color: rgba(19, 211, 77, 0.7); /* 选中模式的背景色 */
  color: white;
}
.v-btn.active {
  background-color: #007bff;
  color: white;
}
.grid {
  /* margin: 0 auto 0 0; */

  display: grid;
  grid-template-columns: auto repeat(6, 1fr); /* 7列灯光 + 1列控制按钮 */
  grid-template-rows: auto repeat(7, 1fr); /* 7行灯光 + 1行控制按钮 */
  gap: 10px; /* 可调整间距 */
  width: max-content;
  height: 100%;
  position: relative;
}

.control-btn-left {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  margin-left: auto;
  font-size: 25px;
  width: 0;
}
.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  width: min-content;
  margin: auto auto 0 auto;
}

.light-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brightness-indicator {
  margin: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(19, 211, 77, 0.434); /* 亮度颜色 */
  transition: height 0.3s ease;
}

.light-layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 0;
}

.selected {
  border: 2px solid blue;
  background-color: #e0f7fa;
}

.broken {
  background-color: #ffcccb;
}

.broken.selected {
  border: 2px solid darkred;
}
</style>
