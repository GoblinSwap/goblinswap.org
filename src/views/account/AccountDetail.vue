<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="22vh"
      width="540px">
      <div class="account_dialog">
        <button class="account_out" @click="btnOut">{{this.$t('swap.swap54')}}</button>
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap28')}}</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <div class="dialog_detail">
          <p class="dialog_copy"><span>{{this.$t('swap.swap29')}}</span><span style="cursor: pointer;" @click="copy(accountDetail.address)">{{this.$t('swap.swap30')}}</span></p>
          <p class="dialog_account">{{accountDetail.address}}</p>
        </div>
        <p class="dialog_income">{{this.$t('swap.swap31')}}</p>
        <p class="dialog_assets">{{earned}} <span>GOBLIN</span></p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
    copys,
    chainIdNumber
  } from '@/api/util'
export default {
  props:["earned"],
  data() {
    return {
      dialogVisible: true,
      accountDetail:"",
    };
  },
  mounted() {
    let chain = localStorage.getItem(chainIdNumber());
    this.accountDetail = chain?JSON.parse(chain)[0]:"";
  },
  methods: {
    /**
     * 复制方法
     * @param sting
     **/
    copy(sting) {
      copys(sting);
      this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
    },
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    btnOut(){
      localStorage.clear();
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
    min-height: 304px;
    background: #222222;
    box-shadow: 0px 1px 4px 0px rgba(255, 255, 255, 0.5);
    border-radius: 22px;
    padding: 29px 70px;
}
  .account_dialog {
    position: relative;

    .account_out {
      position: absolute;
      bottom: 25px;
      right: 0px;
      min-width: 113px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid #FFFFFF;
      font-size: 18px;
      color: #FFFFFF;
      line-height: 40px;
      background: transparent;
    }
    .dialog_detail {
      border-radius: 12px;
      border: 1px solid #5B5B5B;
      margin: 24px auto 0px;
      padding: 19px 24px;
      .dialog_account {
        text-align: left;
        margin-top: 14px;
        font-size: 16px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 18px;
      }
      .dialog_copy {
        display: flex;
        justify-content: space-between;
        span{
          font-size: 20px;
          font-weight: 400;
          color: #BEBEBE;
          line-height: 18px;
          letter-spacing: 1px;
        }
      }
    }
    .dialog_income {
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 22px;
      letter-spacing: 1px;
      text-align: center;
      margin-top: 34px;
    }
    .dialog_assets {
      font-size: 16px;
      font-weight: 400;
      color: #FFFFFF;
      line-height: 18px;
      letter-spacing: 1px;
      margin-top: 12px;
      span{
        color: #6FAF1E;
      }
    }
    .dialog_head {
      display: flex;
      justify-content: space-between;
      .dialog_title {
        font-size: 24px;
        font-weight: 500;
        color: #BEBEBE;
        line-height: 30px;
        letter-spacing: 1px;
      }
      .dialog_close {
        margin-top: -9px;
        margin-right: -50px;
        color: #ffffff;
        font-size: 30px;
        cursor: pointer;
      }
    }
  }
</style>
