<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="17vh"
      width="540px">
      <div class="account_dialog">
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap32')}}</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <p class="dialog_title_ps">{{this.$t('swap.swap33')}}</p>
        <div class="account_div">
          <p class="account_lab">{{this.$t('swap.swap34')}}</p>
          <input type="text" maxlength="255" v-model="keys" :placeholder="this.$t('swap.swap35')">
        </div>
        <div class="account_div">
          <p class="account_lab">{{this.$t('swap.swap21')}}</p>
          <input type="password" maxlength="15" v-model="pass" :placeholder="this.$t('swap.swap22')">
        </div>
        <div class="account_div">
          <p class="account_lab">{{this.$t('swap.swap23')}}</p>
          <input type="password" maxlength="15" v-model="checkPass" :placeholder="this.$t('swap.swap24')">
        </div>
        <button class="btn_submit" @click="keyImport">{{this.$t('swap.swap36')}}</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import {
    chainID,
    defaultAddressInfo,
    localStorageByAddressInfo,
  } from '@/api/util'
export default {
  data() {
    return {
      dialogVisible: true,
      keys:"",
      pass:"",
      checkPass:"",
      prefix:"",
      addressContract:"",
      
    };
  },
  mounted() {
    this.$nextTick(function () {
      this.addressContract = this.$store.getters.getAddressContract;
    });
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    /**
     * @disc: 私钥导入账户提交
     * @author: Wave
     */
    keyImport() {
      let patrn = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
      if(!this.keys){
        this.$message({message: this.$t('importAddress.importAddress9'), type: 'error', duration: 1000});
        return false;
      }
      if(this.keys.length<60 || this.keys.length>66){
        this.$message({message: this.$t('importAddress.importAddress91'), type: 'error', duration: 1000});
        return false;
      }
      if(!this.pass){
        this.$message({message: this.$t('importAddress.importAddress10'), type: 'error', duration: 1000});
        return false;
      }
      if(!patrn.exec(this.pass)){
        this.$message({message: this.$t('importAddress.importAddress11'), type: 'error', duration: 1000});
        return false;
      }
      if(!this.checkPass){
        this.$message({message: this.$t('importAddress.importAddress12'), type: 'error', duration: 1000});
        return false;
      }
      if(this.pass!=this.checkPass){
        this.$message({message: this.$t('importAddress.importAddress13'), type: 'error', duration: 1000});
        return false;
      }
      const newAddressInfo = nuls.importByKey(chainID(), this.keys, this.pass, this.prefix);
      // console.log(newAddressInfo)
      let keyAddressInfo = defaultAddressInfo;
      keyAddressInfo.address = newAddressInfo.address;
      keyAddressInfo.aesPri = newAddressInfo.aesPri;
      keyAddressInfo.pub = newAddressInfo.pub;
      localStorageByAddressInfo(keyAddressInfo);
      //this.$emit("dialogClose",0)
      location.reload();
    },
    
  },
};
</script>
<style lang="less" scoped>
/deep/.el-dialog {
  background: transparent;
}
/deep/ .el-dialog__header {
  display: none;
}
/deep/.el-dialog__body {
    background: #222222;
    box-shadow: 0px 1px 4px 0px rgba(255, 255, 255, 0.5);
    border-radius: 22px;
    padding: 29px 70px;
}
    .dialog_head {
      display: flex;
      justify-content: space-between;
      .dialog_title {
        font-size: 24px;
        font-weight: 500;
        color: #BEBEBE;
        line-height: 30px;
      }
      .dialog_close {
        margin-top: -9px;
        margin-right: -50px;
        color: #ffffff;
        font-size: 30px;
        cursor: pointer;
      }
    }
    .dialog_title_ps {
      text-align: left;
      margin-top: 9px; 
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
    }
    .account_div {
      margin-top: 24px;
      p{
        font-size: 16px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 18px;
        text-align: left;
      }
      input{
        padding: 0 24px;
        height: 58px;
        border-radius: 12px;
        opacity: 0.7;
        border: 1px solid #5B5B5B;
        width: 100%;
        font-size: 20px;
        font-weight: 400;
        color: #8C8C8C;
        line-height: 18px;
        margin-top: 16px;
        background: transparent;
      }
    }
    .btn_submit {
      height: 58px;
      background: #6FAF1E;
      border-radius: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      line-height: 58px;
      width: 100%;
      margin-top: 36px;
      cursor: pointer;
    }
    
</style>
