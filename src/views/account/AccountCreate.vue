<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="22vh"
      width="540px">
      <div class="account_dialog">

        
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap19')}}</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <p class="dialog_title_ps">{{this.$t('swap.swap20')}}：</p>
        <div class="account_div">
          <p class="account_lab">{{this.$t('swap.swap21')}}</p>
          <input type="password" maxlength="15" v-model="pass" :placeholder="this.$t('swap.swap22')">
        </div>
        <div class="account_div">
          <p class="account_lab">{{this.$t('swap.swap23')}}</p>
          <input type="password" maxlength="15" v-model="checkPass" :placeholder="this.$t('swap.swap24')">
        </div>
        <button class="btn_submit" @click="newAddressSubmitForm">{{this.$t('swap.swap25')}}</button>
        <p class="account_ps">{{this.$t('swap.swap26')}}<span @click="btnImport">{{this.$t('swap.swap27')}}>></span></p>
        
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
    passwordVerification,
  } from '@/api/util'
export default {
  data() {
    return {
      dialogVisible: true,
      prefix:"",
      pass:"",
      checkPass:"",
    };
  },
  mounted() {
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    btnImport(){
      this.$emit("dialogClose",2)
    },
    /**
     * @disc: 创建账户提交
     * @date: 2019-08-31 16:01
     * @author: Wave
     */
    async newAddressSubmitForm() {
      let patrn = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
      if(!this.pass){
        this.$message({message: this.$t('newAddress.newAddress22'), type: 'error', duration: 1000});
        return false;
      }
      if(!patrn.exec(this.pass)){
        this.$message({message: this.$t('newAddress.newAddress23'), type: 'error', duration: 1000});
        return false;
      }
      if(!this.checkPass){
        this.$message({message: this.$t('newAddress.newAddress24'), type: 'error', duration: 1000});
        return false;
      }
      if(this.pass!=this.checkPass){
        this.$message({message: this.$t('newAddress.newAddress25'), type: 'error', duration: 1000});
        return false;
      }
      this.newAddressInfo = nuls.newAddress(chainID(), this.pass, this.prefix);
      let isPassword = await passwordVerification(this.newAddressInfo, this.pass, this.prefix);
      console.log(isPassword)
      let newAddressInfos = defaultAddressInfo;
          newAddressInfos.address = this.newAddressInfo.address;
          newAddressInfos.aesPri = this.newAddressInfo.aesPri;
          newAddressInfos.pub = this.newAddressInfo.pub;
          newAddressInfos.key = isPassword.pri;
          
          localStorageByAddressInfo(newAddressInfos);
          this.$emit("dialogClose",3)
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
    .account_ps {
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      margin: 24px 0px 7px;
      span{
        color: #6FAF1E;
        text-decoration: underline;
        cursor: pointer;
      }
    }
</style>
          
