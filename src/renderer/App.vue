<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { headMenu } from './utils/menu'
  export default {
    name: 'electron-notepad3',
    mounted () {
      headMenu()
      this.tool.electron.ipcRenderer.on('message', (ipc, state, text, info) => {
        if (state === 'updateDownloaded') {
          if (confirm('有新版本可更新, 是否更新?')) {
            this.tool.electron.ipcRenderer.send('updateNow')
          }
        }
      })
      this.$bus.$on('checkForUpdate', () => {
        this.tool.electron.ipcRenderer.send('checkForUpdate')
      })
    }
  }
</script>

<style>
  /* CSS */
</style>
