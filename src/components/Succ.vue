<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="17vh"
      width="540px">
      <div class="account_dialog">
        <div  class="dialog_head">
          <div class="dialog_title" v-if="succType==1">{{this.$t('swap.swap7')}} {{lockNum}} NULS</div>
          <div class="dialog_title" v-else-if="succType==2">{{this.$t('swap.swap8')}} {{rewardNum}} GOBLIN</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <div class="succ_view">
          <img class="succ_icon" src="../assets/img/succ_1.png" alt="">
          <p class="succ_txt" style="margin-top: 37px;">{{this.$t('swap.swap13')}}</p>
          <p class="succ_txt"><a :href="href" target="_blank">{{this.$t('swap.swap14')}}</a></p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: true,
      succType:0,
      lockNum:0,
      rewardNum:0,
      href: "",
      hash:"",
    };
  },
  mounted() {
    this.succType = localStorage.getItem("succType");
    this.lockNum = localStorage.getItem("lockNum");
    this.rewardNum = localStorage.getItem("rewardNum");
     if(this.succType==1){
       this.href = "https://nulscan.io/transaction/info?hash="+localStorage.getItem("lockHash");
     }else if(this.succType==2){
      this.href = "https://nulscan.io/transaction/info?hash="+localStorage.getItem("hash");
    }
  },
  methods: {
    btnDialogClose(){
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
    .succ_view {
      margin-top: 48px;
      .succ_icon {
        width: 96px;
        display: block;
        margin: 0 auto;
      }
      .succ_txt {
        font-size: 16px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 22px;
        a{
          color: #6FAF1E;
        }
      }
    }
   
    
</style>
