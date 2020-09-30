<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="17vh"
      width="540px">
      <div class="account_dialog">
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap9')}}</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <div class="account_div">
          <input type="password" maxlength="15" v-model="pass" :placeholder="this.$t('swap.swap12')">
        </div>
        <div class="password_div">
          <button class="btn_submit" @click="btnDialogClose">{{this.$t('swap.swap10')}}</button>
          <button class="btn_submit" @click="passwordSubmit">{{this.$t('swap.swap11')}}</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props:["type"],
  data() {
    return {
      dialogVisible: true,
      pass:"",
    };
  },
  mounted() {
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    passwordSubmit(){
      if(!this.pass){
        this.$message({message: this.$t('newAddress.newAddress22'), type: 'success', duration: 1000});
        return false;
      }
      if(this.type==1){
        this.$emit('passwordSubmitRewardUnlock', this.pass);
      }else if(this.type==2){
        this.$emit('passwordSubmitLock', this.pass);
      }else if(this.type==3){
        this.$emit('passwordSubmitRewardUnlock', this.pass);
      }else if(this.type==4){
        this.$emit('passSubmitUnLockOld', this.pass);
      }
      
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
    .password_div {
      display: flex;
      justify-content: space-between;
      margin-top: 47px;
      .btn_submit {
        cursor: pointer;
        background: transparent;
        width: 133px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid #FFFFFF;
        font-size: 20px;
        font-weight: 600;
        color: #FFFFFF;
      }
    }
    
    
</style>
