<template>
  <div class="editor-box f100">
    <div class="flex f100">
      <div class="scroll">
        <v-tree
          ref="tree"
          :data="treeData"
          :asideW="asideW"
          @editFileName="editFileName"
          @treeItemDel="treeItemDel"
          @treeItemClick="treeItemClick"
          @viewmodeChange="viewmodeChange"
        >
        </v-tree>
      </div>
      <div class="scroll" style="overflow-x: auto;">
        <v-deformation
          class="editor-el"
          :class="{movedown: files.length > 0}"
          :x="asideW + 5"
          :draggable="2"
          :resizable="2"
          :showHandler="false"
          :move="true"
          size="w"
          axis="x"
          @resizing="onResizing">
            <div class="name-list ellipsis" v-if="files.length > 0">
              <v-draggable class="list-group" element="ul" v-model="files" :options="draggableOptions">
                  <li class="list-group-item" v-for="(vo, index) in files" :key="index">
                    <div class="label" :class="{'active': currentPath === vo.path}" @click="clickTab(vo)" :title="vo.text">
                      <cite>
                        <i class="icon-file handler-icon">&nbsp;</i>
                        {{vo.text}}
                        <i class="icon-close" @click.prevent.stop="closeTab(index)">&nbsp;</i>
                      </cite>
                    </div>
                  </li>
              </v-draggable>
            </div>
            <template v-if="viewmode === 'bigEditor' || viewmode === 'bigMarkdown'">
              <div class="tips">
                <div class="bd">
                  打开大文件会对编辑器的运行造成一定的影响, 暂不支持对大文件的查看/编辑
                </div>
                <div class="ft">
                  <!-- <el-button size="mini" type="info" @click="openBigFile">打开</el-button> -->
                </div>
              </div>
            </template>
            <template v-else-if="viewmode === 'editor'">
              <codemirror ref="codemirror" class="f100 scroll" :value="content" :options="editorConfig" @input="editChanges"></codemirror>
            </template>
            <template v-else-if="viewmode === 'markdown'">
              <v-vuemarkdown ref="markdown" class="md-editor-preview markdown-body f100 scroll" @rendered="rendered">{{content}}</v-vuemarkdown>
            </template>
        </v-deformation>
        <v-deformation
          class="terminal-box fl1"
          :class="{movedown: files.length > 0}"
          :x="asideW + 5"
          :draggable="3"
          :resizable="3"
          :showHandler="false"
          :move="true"
          size="w"
          axis="x"
          :h="200"
          v-show="terminalShow"
          ref="terminal"
          @resizing="onTerminalResizing">
          <v-terminal></v-terminal>
        </v-deformation>
      </div>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import 'github-markdown-css'
import VueMarkdown from 'vue-markdown'
import deformation from '../../components/deformation.vue'
import tree from './tree.vue'
import terminal from './terminal.vue'
require('codemirror/mode/javascript/javascript')
require('codemirror/mode/vue/vue')
require('codemirror/addon/hint/show-hint.js')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/addon/hint/javascript-hint.js')
require('codemirror/theme/base16-dark.css')

export default {
  name: 'Editor',
  data () {
    return {
      viewmode: 'editor',
      deformationPopup: null,
      content: '',
      asideW: 240,
      terminalH: 0,
      editorConfig: {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'base16-dark'
      },
      draggableOptions: {
        group: 'label'
      },
      storeTree: {},
      treeEvents: {},
      newFileNum: 1,
      files: [],
      pathMap: {},
      nextFile: '',
      currentPath: '',
      current: {},
      nextId: 0,
      data: [],
      treeData: [],
      terminalShow: false
    }
  },
  components: {
    'v-tree': tree,
    'v-terminal': terminal,
    'v-draggable': draggable,
    'v-vuemarkdown': VueMarkdown,
    'v-deformation': deformation
  },
  methods: {
    onTerminalResizing (left, top, width, height) {
      this.terminalH = height
    },
    // 打开markdown里的链接时, 会离开编辑器环境, 拦截一下
    rendered () {
      this.$nextTick(() => {
        this.$refs.markdown && this.$refs.markdown.$el.addEventListener('click', (e) => {
          let node
          if (e.target.tagName.toLowerCase() === 'a') {
            let url = e.target.getAttribute('href')
            if (url) {
              if (/^http(s|):\/\//.test(url)) {
                this.$msgbox({
                  type: 'warning',
                  title: '提示',
                  width: 300,
                  message: '是否使用外部浏览器打开当前链接?',
                  center: true,
                  showCancelButton: true,
                  cancelButtonText: '取消',
                  confirmButtonText: '打开'
                }).then(() => {
                  this.tool.electron.shell.openExternal(url)
                }).catch(() => {
                })
              } else {
                let path
                let info
                if (/(\.|\/)/.test(url)) {
                  path = this.tool.path.resolve(this.current.dir, url)
                } else if (url.slice(0, 6) === 'file://') {
                  path = url
                }
                if (path) {
                  info = this.tool.path.parse(path)
                  node = {
                    ext: info.ext.slice(1),
                    icon: (info.ext.length > 1 ? 'tree-type tree-type-' + info.ext.slice(1) + ' ' : '') + 'tree-file',
                    path: path,
                    text: path,
                    type: 'file',
                    pushed: !!0,
                    opened: !!0,
                    selected: !!0,
                    viewmode: this.viewmode
                  }
                  this.$set(this.storeTree, path, node)
                }
              }
            }
          }
          if (node) {
            this.pathMap[node.path] = node
            this.clickTab(node)
            // this.openFile(node, this.viewmode)
          }
          e.preventDefault()
          return false
        }, true)
      })
    },
    openBigFile () {
      this.$msgbox({
        type: 'warning',
        center: true,
        title: '提示',
        message: '暂不支持打开超过 3M 的文件~'
      }).catch(() => {
      })
    },
    viewmodeChange (data, mode) {
      this.openFile(data, mode)
    },
    editFileName (oldPath, newPath, file) {
      this.pathMap[newPath] = file
      delete this.pathMap[oldPath]
    },
    onUpdate (event) {
      // this.files.splice(event.newIndex, 0, this.files.splice(event.oldIndex, 1)[0])
    },
    clickTab (vo) {
      this.currentPath = vo.path
      let data = this.pathMap[vo.path]
      this.openFile(data, data.viewmode)
    },
    closeTab (index) {
      let num
      let len = this.files.length
      let file
      if (len === 1) {
        this.content = ''
      } else if (len > 1) {
        if (this.currentPath === this.files[index].path) {
          if (index === len - 1) {
            num = index - 1
          } else {
            num = index + 1
          }
          file = this.files[num]
          this.nextPath = file.path
          clearTimeout(this.nextId)
          this.nextId = setTimeout(() => {
            this.currentPath = this.nextPath
            this.tool.file.readFile(this.nextPath, (err, data) => {
              if (err === null) {
                this.content = data
                this.viewmode = (file || {}).viewmode || 'editor'
              }
            })
          }, 200)
        }
      }
      let node = this.pathMap[this.files[index].path]
      node.pushed = !!0
      this.files.splice(index, 1)
    },
    editChanges (val) {
      this.content = val
    },
    onResizing (left, top, width, height) {
      this.asideW = left
    },
    async treeItemDel (node, item) {
      let path = item.path
      this.tool.file.delfile(item, () => {
        this.$set(node.$parent.data, 'children', node.$parent.data.children.filter(item => {
          return path !== item.path
        }))
      })
    },
    async treeItemClick (node, item) {
      if (item.input !== 1) {
        return this.openFile(item, 'editor')
      }
    },
    async openFile (node, mode, refresh) {
      node.opened = refresh ? !!1 : !node.opened
      return new Promise((resolve, reject) => {
        let stats
        if (node.type === 'file') {
          if (!node.stats) {
            stats = this.tool.file.getStats(node.path)
            this.$set(node, 'stats', {
              size: stats.size
            })
          }
          if (node.stats.size > 1024 * 1024 * 3) {
            this.viewmode = mode = 'big' + this.viewmode.replace(/./, m => {
              return m.toUpperCase()
            })
            resolve()
          } else {
            if (!node.pushed) {
              this.pathMap[node.path] = node
              this.$set(node, 'pushed', !!1)
              this.files.push(node)
            }
            this.currentPath = node.path
            this.current = this.tool.path.parse(node.path)
            // this.$store.commit('SET_CURRENT', this.currentPath)
            this.tool.file.readFile(node.path, (err, data) => {
              if (err === null) {
                // this.$store.commit('SET_FILE', data)
                this.content = data
                // console.log(data)
                node.opened = !node.opened
                resolve()
              } else {
                console.log(err)
                reject(err)
              }
            })
          }
        } else {
          if (!node.children || node.children.length === 0 || refresh) {
            // this.$set(node, 'loading', true)
            this.tool.file.fileDisplay(node.path).then(tree => {
              // this.$set(node, 'loading', false)
              this.$set(node, 'children', tree.children || tree)
              resolve()
            })
          } else {
            resolve()
          }
        }
      }).then(() => {
        this.viewmode = mode || 'editor'
      })
    }
  },
  mounted () {
    this.treeData = this.$store.getters.dir ? [this.$store.getters.dir] : []
    this.$bus.$off('newDir').$on('newDir', (node, item, done) => {
      this.treeItemClick(node, item).then(() => {
        item.children.unshift({
          type: 'dir',
          path: this.tool.path.join(item.path, '新建文件夹'),
          // pos: stats.name,
          text: '新建文件夹',
          // ext: '',
          stats: {
            size: 0
          },
          children: [],
          mock: !!1,
          pushed: !!0,
          opened: !!0,
          selected: !!0
        })
        done()
      })
      // this.tool.file.mkdir(path, function () {

      // })
    })
    this.$bus.$off('setDir').$on('setDir', () => {
      let path = this.tool.file.openDirectory(['openDirectory'])
      if (path && path[0]) {
        this.tool.file.fileDisplay(path[0]).then(tree => {
          this.$store.commit('SET_DIR', this.tool.copy(tree))
          this.treeData = [tree]
        })
      }
    })
    this.$bus.$off('openFile').$on('openFile', () => {
      this.tool.file.selectFile({}, (err, data, path) => {
        let node
        if (err === null) {
          if (data) {
            this.content = data
          }
          if (path) {
            this.currentPath = path
          }
          if (path && this.files.filter(item => item.path === path).length < 1) {
            node = {
              icon: 'tree-file',
              path: path,
              text: path,
              type: 'file',
              pushed: !!1,
              selected: !!0
            }
            this.files.push(node)
            this.pathMap[path] = node
          }
        }
      })
    })
    this.$bus.$off('newFile').$on('newFile', path => {
      let newFile = {
        icon: 'tree-file',
        path: path || 'Untitled-' + this.newFileNum,
        text: 'Untitled-' + this.newFileNum++,
        type: 'file',
        newFile: !!1,
        pushed: !!1,
        selected: !!0
      }
      this.content = ''
      this.currentPath = newFile.path
      this.files.push(newFile)
      this.pathMap[newFile.path] = newFile
    })
    this.$bus.$off('saveFile').$on('saveFile', () => {
      let text = this.content
      let path = this.currentPath
      let node = this.pathMap[path]
      if (node.newFile) {
        this.$bus.$emit('saveAsFile', path)
      } else {
        text = text.replace(/\n/g, '\r\n')
        this.tool.file.saveFile(path, text, () => {
        })
      }
    })
    this.$bus.$off('saveAsFile').$on('saveAsFile', path => {
      let text = this.content
      text = text.replace(/\n/g, '\r\n')
      this.tool.file.setFilePath({
        defaultPath: this.currentPath
      }, filename => {
        if (filename) {
          this.tool.file.saveFile(filename, text, () => {
            if (path) {
              let node = this.pathMap[path]
              let info = this.tool.path.parse(filename)
              node.path = filename
              node.text = info.name
              node.newFile = 2
              this.pathMap[filename] = node
              delete this.pathMap[path]
            }
          })
        }
      })
    })
    this.$bus.$off('refreshDir').$on('refreshDir', (node, item) => {
      this.openFile(item, this.viewmode, true)
    })
    this.$bus.$off('toggleTerminal').$on('toggleTerminal', (node, item) => {
      this.terminalShow = !this.terminalShow
      this.terminalShow && this.$refs.terminal.reInit()
    })
  }
}
</script>
<style lang="scss">
// .flex-column{
//   flex-direction: column;
// }
// .fl1{
//   flex: 1;
// }
.terminal-box{
  position: absolute;
  top: auto!important;
  bottom: 0;
  right: 0;
  z-index: 999;
  width: auto!important;
  outline: none;
  border-top: 1px solid #3f3f3f;
  border-left: 1px solid #3f3f3f;
  background-color: #111;
  cursor: auto!important;
}
.editor-box {
  .name-list{
    height: 24px;
    width: 100%;
    background-color: #222;
    position: relative;
    z-index: 20;
    color: #ccc;
    cursor: auto;
    // padding: 0px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    .label{
      width: 100%;
      padding: 4px 20px 4px 8px;
      font-size: 14px;
      /* background: rgba(255, 255, 255, .05); */
      /* border-radius: 3px; */
      margin-right: 3px;
      display: inline-block;
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .icon-close{
        color: #ccc;
        font-size: 10px;
        font-weight: bold;
        display: none;
        margin-left: 2px;
        cursor: pointer;
        position: absolute;
        top: 50%;
        margin-top: -5px;
        right: 3px;
        left: auto;
      }
      cite{
        cursor: pointer;
        font-style: normal;
      }
    }
    .list-group-item{
      display: inline-block;
      max-width: 120px;
      .label.active{
        background: rgba(0, 0, 0, .5);
      }
      .label:hover .icon-close,
      .label.active .icon-close{
        display: inline;
      }
    }
  }
  .editor-el{
    height: 100%!important;
    right: 0!important;
    width: auto!important;
    cursor: auto!important;
    outline: none;
    &.movedown{
      padding-top: 24px!important;
      margin-top: -24px;
    }
    .CodeMirror{
      height: 100%;
    }
  }
  .tips{
    padding: 20px;
    text-align: center;
    font-size: 14px;
    .bd{
      line-height: 20px;
      padding: 10px 0;
    }
  }
  .markdown-body{
    background: #fff;
    padding: 10px 20px;
  }
}
</style>

