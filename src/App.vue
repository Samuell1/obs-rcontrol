<template>
  <div class="app">
    <div class="w-full">
      <div class="mb-6">
        <div class="md:w-1/3">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">
            Status
          </label>
        </div>
        <div class="md:w-2/3 flex">
          <span class="rounded-full text-white bg-green uppercase px-2 py-1 text-xs mr-3" v-if="status == 1">Connected</span>
          <span class="rounded-full text-white bg-red uppercase px-2 py-1 text-xs mr-3" v-else-if="status == 0">Disconnected</span>
          <button v-if="status != 'connected'" class="bg-white hover:bg-grey-lightest text-grey-darkest px-2 py-1 text-xs mr-3 border border-grey-light rounded shadow" @click="createConnection">
            Reconnect
          </button>
        </div>
      </div>
      <div class="flex -mx-3 mb-6">
        <div class="w-full px-3 mb-6">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="Address">
            Address
          </label>
          <input class="bg-grey-lighter appearance-none border-2 border-grey-lighter rounded block w-full py-2 px-4 text-grey-darker leading-tight focus:outline-none focus:bg-white focus:border-indigo" id="Address" type="text" v-model="login.address">
        </div>
        <div class="w-full px-3 mb-6">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="Password">
            Password
          </label>
          <input class="bg-grey-lighter appearance-none border-2 border-grey-lighter rounded block w-full py-2 px-4 text-grey-darker leading-tight focus:outline-none focus:bg-white focus:border-indigo" id="Password" type="password" v-model="login.password">
        </div>
      </div>
    </div>
    <div class="w-full pt-4 border-t border-grey-light" v-if="status">
      <div class="flex -mx-3 mb-6">
        <div class="w-full px-3 mb-6">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="Scene">Active Scene</label>
          <div class="relative">
            <select class="bg-grey-lighter appearance-none border-2 border-grey-lighter rounded w-full py-2 px-4 text-grey-darker leading-tight focus:outline-none focus:bg-white focus:border-indigo" v-model="activeScene" id="Scene">
              <option :value="scene.name" :key="scene.name" v-for="scene in sceneList">{{ scene.name }}</option>
            </select>
            <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        <div class="w-full px-3 mb-6">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="Scene">Overlay Scene</label>
          <div class="relative">
            <select class="bg-grey-lighter appearance-none border-2 border-grey-lighter rounded w-full py-2 px-4 text-grey-darker leading-tight focus:outline-none focus:bg-white focus:border-indigo" v-model="overlayScene" id="Scene">
              <option :value="scene.name" :key="scene.name" v-for="scene in sceneList">{{ scene.name }}</option>
            </select>
            <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-6">
        <div class="md:w-1/3">
          <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="Keycode">
            Keybind
            <span class="rounded-full text-white bg-green uppercase px-2 py-1 text-xs mr-3" v-if="keybindStatus == 1">Active</span>
            <span class="rounded-full text-white bg-red uppercase px-2 py-1 text-xs mr-3" v-else-if="keybindStatus == 0">Disabled</span>
          </label>
        </div>
        <div class="flex md:w-2/3">
          <select class="bg-grey-lighter appearance-none border-2 border-grey-lighter rounded w-full py-2 px-4 text-grey-darker leading-tight focus:outline-none focus:bg-white focus:border-indigo" v-model="keycode" id="Keycode">
            <option :value="key" :key="key" v-for="(value, key) in keycodes">{{ value }}</option>
          </select>
          <button class="bg-white hover:bg-grey-lightest text-grey-darkest px-2 py-1 text-xs mr-3 border border-grey-light rounded shadow" @click="keybindHandler">
            {{ keybindStatus ? 'Unbind':'Bind' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="history.length" class="history p-2 mt-3 bg-grey-light text-grey-darkest text-sm rounded">
      <div v-for="(value, key, index) in history" :key="index">{{ value }}</div>
    </div>
  </div>
</template>

<script>
import OBSWebSocket from 'obs-websocket-js'
import ioHook from 'iohook'
import debounce from 'lodash.debounce'

import keycodes from './keycodes.js'

export default {
  name: 'App',
  data () {
    return {
      obs: null,
      activeScene: '',
      overlayScene: '',
      sceneList: [],
      keycodes: keycodes,

      keycode: 34,

      login: {
        address: 'localhost:4444',
        password: ''
      },

      keybindStatus: 0,
      status: 0,

      history: []
    }
  },
  methods: {
    keybindHandler () {
      if (this.keybindStatus) {
        this.unbindEventHook()
      } else {
        this.bindEventHook()
      }
    },
    bindEventHook () {
      ioHook.on('keydown', event => this.detectKeybindState(event))
      ioHook.on('keyup', event => this.detectKeybindState(event))
      ioHook.start()
      this.keybindStatus = 1
    },
    unbindEventHook () {
      ioHook.stop()
      this.keybindStatus = 0
    },
    detectKeybindState: debounce(async function({ keycode, type }) {
      let scene
      if (keycode == this.keycode) {
        if (type == 'keydown') {
          scene = this.overlayScene
        } else if (type == 'keyup') {
          scene = this.activeScene
        }
        this.history.unshift(`Action ${type} - ${keycode}, Scene: ${scene}`)
        try {
          await this.obs.setCurrentScene({ 'scene-name': scene })
        } catch ({ error }) {
          this.history.unshift(`Error: ${error}`)
        }
      }
    }),
    async createConnection () {
      this.obs = null
      this.obs = new OBSWebSocket()

      try {
        await this.obs.connect(this.login)
        await this.obs.getSceneList({}, (err, { currentScene, scenes }) => {
          this.status = 1
          this.activeScene = currentScene
          this.sceneList = scenes
        })
      } catch ({ error }) {
        this.status = 0
        this.history.unshift(`Error: ${error}`)
      }
    }
  }
}
</script>

<style lang="scss">
.app {
  padding: 16px;
}
.history {
  overflow-y: scroll;
  max-height: 300px;
}
</style>

