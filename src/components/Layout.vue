<template>
  <div class="layout_view">
    <div class="layout_head">
      <div class="layout_left"></div>
      <div class="layout_logo"><img src="../assets/img/logo.png" alt=""></div>
      <div class="layout_right">
        <button class="layout_login" v-show="accountDetail">{{accountDetail.balance}}</button>
        <button class="layout_login layout_account" v-show="accountDetail" @click="btnBackup">
          <img class="address_icon" src="../assets/img/nuls.png" alt="">
          {{accountDetail.addresss}}
        </button>
        <div class="layout_lang" v-show="!accountDetail">
          <el-dropdown  trigger="click" @command="btnLogin">
            <div class="lang_background"></div>
            <span class="el-dropdown-link layout_lang_active">
                {{this.$t('swap.swap1')}}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">{{this.$t('swap.swap57')}}</el-dropdown-item>
              <el-dropdown-item command="2">{{this.$t('swap.swap58')}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="layout_lang">
          <el-dropdown @command="selectLanguage" trigger="click">
            <div class="lang_background"></div>
            <span class="el-dropdown-link layout_lang_active">
                {{lang=="cn"?'繁體中文':'English'}}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="cn">繁體中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="kobold_content">
      <router-view ref="child"></router-view>
    </div>
    <div class="kobold_foot">
      <layout-foot></layout-foot>
    </div>
  </div>
</template>

<script>

import axios from 'axios'
import {chainID,chainIdNumber,timesDecimals,addressInfo,superLong,} from '@/api/util'
import layoutFoot from "../components/LayoutFoot";
export default {
  components: {
    layoutFoot,
  },
  data () {
    return {
      lang: localStorage.getItem("lang") || 'cn', //语言选择
      showDialogId:0,
      accountDetail:"",
      addressList: [], //地址列表
      serviceUrls: {},//服务节点信息
      heightInfo: [],//高度信息
      failedNu: 0,//失败请次数
    }
  },
  created() {
      localStorage.setItem("lang",this.lang?this.lang:'cn')
      this.serviceUrls = {};
      let newUrlData = this.$store.getters.getUrlData;
      this.serviceUrls = newUrlData.filter(item => item.selection)[0];
      localStorage.setItem('url', JSON.stringify(this.serviceUrls));
      
      setInterval(() => {
        let newUrlData = this.$store.getters.getUrlData;
        this.serviceUrls = newUrlData.filter(item => item.selection)[0];
        localStorage.setItem('url', JSON.stringify(this.serviceUrls));
      }, 500);
    },
  mounted(){
    this.$nextTick(function () {
      let that = this;
      let chain = localStorage.getItem(chainIdNumber());
      this.accountDetail = chain?JSON.parse(chain)[0]:"";
      setTimeout(function(){
        that.getHeaderInfo();
        that.getAddressInfo();
        setInterval(function(){
          that.getHeaderInfo();
          that.getAddressInfo();
        },10000)
      },300)
      
    })
  },
  methods:{
    /**
     * 语言切换
     */
    selectLanguage(command) {
      this.lang = command;
      localStorage.setItem("lang",this.lang)
      //this.$i18n.locale = this.lang;
      location.reload();
    },
    btnLogin(el){
      if(el==1){
        this.$refs.child.dialogCreate();
      }else if(el==2){
        window.open("https://wallet.nuls.io/newAddress","_blank");
      }
    },
    btnBackup(){
      this.$refs.child.dialogDetail();
    },
    
    /**
     * 获取主网最新高度和本地高度
     */
    getHeaderInfo() {
      const url = localStorage.hasOwnProperty("url") && localStorage.getItem('url') !== 'undefined' ? JSON.parse(localStorage.getItem('url')).urls : 'http://192.168.1.40:18003/';
      const params = {
        "jsonrpc": "2.0", "method": "getInfo", "params": [chainID()], "id": Math.floor(Math.random() * 1000)
      };
      //console.log(url);
      //console.log(params);
      axios.post(url, params)
        .then((response) => {
          //console.log(response.data);
          if (response.data.hasOwnProperty("result")) {
            this.heightInfo = response.data.result;
            sessionStorage.setItem("info", JSON.stringify(response.data.result))
          } else {
            this.heightInfo = {localHeight: 0, networkHeight: 0};
            sessionStorage.removeItem("info")
          }
        })
        .catch((error) => {
          sessionStorage.removeItem("info");
          this.heightInfo = {localHeight: 0, networkHeight: 0};
          console.log("getInfo:" + error)
        })
    },
    /**
     * 获取地址网络信息
     **/
    async getAddressInfo() {
      let addressInfos = addressInfo(1);
      let addressList = addressInfo(0);
      if (addressInfos) {
        await this.$post('/', 'getAccount', [addressInfos.address], 'Layout')
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let item of addressList) {
                if (item.address === addressInfos.address) {
                  item.alias = response.result.alias;
                  item.balance = timesDecimals(response.result.balance).toFixed(3);
                  item.consensusLock = timesDecimals(response.result.consensusLock);
                  item.totalReward = timesDecimals(response.result.totalReward);
                  item.addresss = superLong(item.address, 5);
                  if (response.result.lastReward) {
                    item.lastReward = timesDecimals(response.result.lastReward);
                  } else {
                    item.lastReward = 0;
                  }
                  item.tokens = [];
                  //item.chainId = nuls.verifyAddress(item.address).chainId;
                }
              }
              localStorage.setItem(chainIdNumber(), JSON.stringify(addressList));
              let chain = localStorage.getItem(chainIdNumber());
              this.accountDetail = chain?JSON.parse(chain)[0]:"";
              //this.$store.commit('setAddressInfo', addressList);
            }
          })
      }
    },
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  /deep/ .el-dropdown-menu__item {
    text-align: center;
  }
  .layout_view {
    height: 100%;
    position: relative;
  }
  .kobold_content {
    min-height: 600px;
    width: 100%;
    box-sizing: border-box;
  }
  .layout_head {
    display: flex;
    justify-content: space-between;
    height: 90px;
    width: 100%;
    padding: 28px 45px 0px;
    box-sizing: border-box;
    .layout_left {
      width: 45%;
    }
    .layout_logo {
      width: 120px;
      height: 110px;
      flex-shrink: 0;
      img{
        width: 100%;
      }
    }
    .layout_right {
      width: 45%;
      display: flex;
      justify-content: flex-end;
      
      
      .layout_lang {
        min-width: 80px;
        height: 34px;
        background: #606060;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        background: transparent;
        .el-dropdown {
          position: relative;
          width: 100%;
        }
        .lang_background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid red;
          background: rgba(7,125,41,0.47);
          border-radius: 6px;
          filter: blur(10px);
        }
        .layout_lang_active {
          font-size: 12px;
          font-weight: 500;
          color: #6FAF1E;
          line-height: 34px;
        }
      }
      .layout_login {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        cursor: pointer;
        margin-right: 15px;
        min-width: 80px;
        height: 34px;
        background: #606060;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #6FAF1E;
        line-height: 34px;
        border: none;
        .address_icon {
          width: 20px;
          vertical-align: middle;
          margin-top: -3px;
        }
      }
      .layout_account {
        background: transparent;
      }
    }
  }
</style>
