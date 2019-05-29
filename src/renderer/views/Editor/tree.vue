<template>
  <div class="tree-box" 
      :style="{width: asideW + 'px', height: '100%', overflowX: 'hidden'}">
    <v-jstree
      class="file-tree scroll"
      whole-row
      allow-batch
      :data="data"
      :item-events="treeEvents"
      @item-click="itemClick">
      <template slot-scope="vo">
        <i :class="vo.vm.themeIconClasses" role="presentation" v-if="!vo.model.loading"></i>
        <span v-html="vo.model.text" v-if="!vo.model.input"></span>
        <template v-else>
          <input v-model="editInputVal" ref="renameInput" @keyup="editFileNameByKey($event, vo.model, vo)" @blur="editFileName(vo.model, vo)"/>
        </template>
      </template>
    </v-jstree>
  </div>
</template>
<script>
export default {
  data () {
    return {
      editInputVal: '',
      treeEvents: {
        contextmenu: (node, data, $event) => {
          // console.log(node, data, $event)
          // this.$emit('treeContextmenu', node, data, $event)
          this.treeContextmenu(node, data, $event)
        }
      }
    }
  },
  props: {
    asideW: {
      type: Number,
      default: 0
    },
    data: {
      type: Array,
      default: []
    }
  },
  methods: {
    // 点击右键菜单 - 重命名
    renameClick (data) {
      this.editInputVal = data.text
      this.$set(data, 'input', 1)
      this.$nextTick(() => {
        this.inputfocus()
      })
    },
    itemClick (node, item) {
      this.$emit('treeItemClick', node, item)
    },
    editFileNameByKey ($event, data, vo) {
      if ($event.keyCode === 27) {
        this.$set(data, 'input', !!0)
      }
      if ($event.keyCode === 13) {
        this.$set(data, 'input', !!0)
        this.editFileName(data, vo)
      }
    },
    // 确认修改文件
    editFileName (data) {
      this.$set(data, 'input', !!0)
      if (this.editInputVal && this.editInputVal !== data.text) {
        this.$set(data, 'text', this.editInputVal)
        this.$bus.$emit('rename', data)
      }
    },
    inputfocus () {
      this.$refs.renameInput && this.$refs.renameInput.focus()
    },
    treeContextmenu (node, item, $event) {
      let Menu = this.tool.menu.Menu
      let MenuItem = this.tool.menu.MenuItem
      let remote = this.tool.menu.remote

      let menu = new Menu()
      let finfo = this.tool.path.parse(item.path)
      // this.$store.getters
      menu.append(new MenuItem({
        label: '刷新',
        click: () => {
          this.$bus.$emit('refreshDir', node, item)
        }
      }))
      if (item.type === 'file') {
        if (finfo.ext === '.md') {
          menu.append(new MenuItem({
            label: 'markdown文件预览',
            click: () => {
              item.viewmode = 'markdown'
              this.$emit('viewmodeChange', item, 'markdown')
            }
          }))
        }
      } else if (item.type === 'dir') {
        menu.append(new MenuItem({
          label: '新建文件',
          click: () => {
            this.$bus.$emit('newFile', item.path)
          }
        }))
        menu.append(new MenuItem({
          label: '添加文件夹',
          click: () => {
            this.$bus.$emit('newDir', node, item, () => {
              this.renameClick(item.children[0])
            })
          }
        }))
      }
      menu.append(new MenuItem({
        label: '重命名',
        click: () => {
          this.renameClick(item)
        }
      }))
      menu.append(new MenuItem({
        label: '删除',
        click: () => {
          this.$emit('treeItemDel', node, item)
        }
      }))
      menu.append(new MenuItem({
        label: '在资源管理器中显示',
        click: () => {
          this.tool.electron.shell.openExternal(item.path)
        }
      }))
      menu.popup({
        window: remote.getCurrentWindow()
      })
    }
  },
  created () {
    this.$bus.$off('rename').$on('rename', file => {
      if (file && file.path && file.text) {
        let value = file.text
        if (!/(\?|\*|\||<|>|"|\/|:|\\)/.test(value)) {
          let pathInfo = this.tool.path.parse(file.path)
          let newPath = this.tool.path.resolve(pathInfo.dir, value)
          let oldPath = file.path
          if (newPath.length) {
            if (file.type === 'file') {
              this.tool.file.renameFile(oldPath, newPath, error => {
                if (error) {
                  console.log(error)
                } else {
                  file.text = value
                  file.path = newPath
                  this.$emit('editFileName', oldPath, newPath, file)
                }
              })
            } else if (file.type === 'dir') {
              this.tool.file.mkdir(newPath, error => {
                if (error) {
                  console.log(error)
                } else {
                  file.text = value
                  file.path = newPath
                  this.$emit('editFileName', oldPath, newPath, file)
                }
              })
            }
          }
        }
      }
    })
  }
}
</script>
<style lang="scss">
.tree-box {
  .file-tree {
    height: 100%;
    color: #ccc!important;
    .tree-selected{
      input{
        outline: none;
      }
    }
    .tree-children {
      transition-duration: 0ms!important;
    }
    .tree-wholerow{
      z-index: 0!important;
    }
    .tree-wholerow-hovered{
      background: #3f3f3f!important;
    }
    // .tree-selected,
    .tree-wholerow-clicked,
    .tree-wholerow-hovered.tree-wholerow-clicked{
      background: #505050!important;
    }
    li{
      word-break: break-all;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    .tree-last .tree-ocl{
      display: none;
    }
    .tree-loading .tree-ocl{
      display: inline-block;
    }
  }
}
</style>

