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
      window.app = this
      headMenu()
      this.tool.electron.ipcRenderer.on('message', (event, state, text, info) => {
        if (state === 'updateAva') {
          if (confirm('有新版本可更新, 是否现在下载?')) {
            this.tool.electron.ipcRenderer.send('download-new-update')
          }
        } else if (state === 'updateDownloaded') {
          if (confirm('新版本已下载, 是否立即更新?')) {
            this.tool.electron.ipcRenderer.send('updateNow')
          }
        } else if (state === 'updateNotAva') {
          alert('现在使用的就是最新版本，不用更新')
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
