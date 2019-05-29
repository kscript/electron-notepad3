<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { headMenu } from './utils/menu'
  import about from './config/about.json'
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
      this.$bus.$off('about').$on('about', () => {
        this.$msgbox({
          type: 'none',
          title: '关于',
          customClass: 'msgbox-about',
          dangerouslyUseHTMLString: true,
          message: `<ul class="about-detail">
            <li>软件名称: ${about.name}</li>
            <li>当前版本: ${about.version}</li>
            <li>作者: ${about.author}</li>
            <li>更新时间: ${about.time}</li>
            <li>许可证: ${about.license}</li>
            <li>Electron环境: ${about.electron}</li>
          </ul>`
        }).then(() => {
        }).catch(() => {
        })
      })
      this.$bus.$on('checkForUpdate', () => {
        this.tool.electron.ipcRenderer.send('checkForUpdate')
      })
    }
  }
</script>

<style>
  #app{
    height: 100%;
  }
</style>
