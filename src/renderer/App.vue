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
    data () {
      return {
        update: {
          rest: {},
          state: '',
          display: false
        }
      }
    },
    methods: {
      showUpdate (state = this.update.state) {
        if (!this.update.display) return
        const update = this.update
        if (state === 'updateAva') {
          this.$msgbox({
            center: true,
            type: 'success',
            title: '更新版本',
            showCancelButton: true,
            cancelButtonText: '暂不更新',
            confirmButtonText: '立即下载',
            message: '有新版本可更新, 是否现在下载?'
          }).then(() => {
            this.tool.electron.ipcRenderer.send('download-new-update')
          }).catch(() => {})
        } else if (state === 'updateDownloaded') {
          this.$msgbox({
            center: true,
            type: 'success',
            title: '下载成功',
            message: '新版本已下载, 是否立即更新?'
          }).then(() => {
            this.tool.electron.ipcRenderer.send('updateNow')
          }).catch(() => {})
        } else if (state === 'updateNotAva') {
          this.$msgbox('现在使用的就是最新版本，不用更新').catch(() => {})
        } else if (state === 'downloadProgress') {
          // event, state, text, info
          this.$msgbox({
            center: true,
            type: 'info',
            title: '下载最新版本',
            dangerouslyUseHTMLString: true,
            message: this.$createElement({
              template: '<div>下载进度: {{num}}</div>',
              data () {
                return {
                  num: update.num
                }
              }
            })
          }).then(() => {
            this.update.display = true
          }).catch(() => {
            this.update.display = false
          }).then(this.showUpdate)
        }
      }
    },
    mounted () {
      window.app = this
      headMenu()
      this.tool.electron.ipcRenderer.on('message', (event, state, text, info) => {
        console.log(event, state, text, info)
        if (state === 'updateAva') {
          const url = info.assets.filter(item => item.name === 'latest.yml')[0].browser_download_url
          console.log(url)
          this.tool.electron.ipcRenderer.send('setUpdateConfigPath', url)
        }
        this.update.num = info
        this.update.state = state
        this.showUpdate()
      })
      this.$bus.$on('about', () => {
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
        this.$msgbox({
          center: true,
          type: 'warning',
          title: '检查更新',
          showCancelButton: true,
          cancelButtonText: '取消检查',
          confirmButtonText: '好的',
          dangerouslyUseHTMLString: true,
          message: `正在检查是否为最新版本<br>请确保https://api.github.com可以正常访问`
        }).then(() => {
          this.update.display = true
        }).catch(() => {
          this.update.display = false
        }).then(this.showUpdate)
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
