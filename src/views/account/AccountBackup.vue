<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="22vh"
      width="540px">
      <div class="account_dialog">
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap15')}}</div>
          <div class="dialog_close" @click="dialogVisible=false"><i class="el-icon-close"></i></div>
        </div>
        <div class="backup_copy">
          <div class="backup_key">{{accountDetail.key}}</div>
          <div class="backup_copy_btn" @click="copy(accountDetail.key)">{{this.$t('swap.swap16')}}</div>
        </div>
        <p class="backup_ps">{{this.$t('swap.swap17')}}</p>
        <button class="btn_submit" @click="btnSubmit">{{this.$t('swap.swap18')}}</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {chainIdNumber,copys} from '@/api/util'
export default {
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
    btnSubmit(){
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
    .backup_copy {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      .backup_key {
        font-size: 16px;
        font-weight: 400;
        color: #6FAF1E;
        line-height: 18px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
      }
      .backup_copy_btn {
        flex-shrink: 0;
        margin-left: 10px;
        color: #ffffff;
        cursor: pointer;
      }
    }
    .backup_ps {
      margin-top: 36px;
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      text-align: left;
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
      margin-top: 24px;
      cursor: pointer;
    }
  }
</style>
