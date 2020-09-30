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
          <div class="dialog_title" v-else-if="succType==3">{{this.$t('swap.swap62')}} {{unlockNum}} NULS</div>
          <div class="dialog_title" v-else-if="succType==2">{{this.$t('swap.swap8')}} GOBLIN</div>
          <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div>
        </div>
        <div class="succ_view">
          <img class="succ_icon" src="../assets/img/tail-spin.svg" alt="">
          <p class="succ_txt" style="margin-top: 37px;">{{this.$t('swap.swap53')}}</p>
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
      unlockNum:0,
      setIntervalResult:null,
      hash:"",
    };
  },
  mounted() {
    let that = this;
    this.succType = localStorage.getItem("succType");
    this.lockNum = localStorage.getItem("lockNum");
    this.unlockNum = localStorage.getItem("unlockNum");
    if(this.succType==1){
      this.hash = localStorage.getItem("lockHash");
      this.setIntervalResult = setInterval(function(){
        that.getResult();
      },3000)
    }else if(this.succType==2){
      this.hash = localStorage.getItem("hash");
      this.setIntervalResult = setInterval(function(){
        that.getResult();
      },3000)
    }else if(this.succType==3){
      this.hash = localStorage.getItem("unlockHash");
      this.setIntervalResult = setInterval(function(){
        that.getResult();
      },3000)
    }
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    getResult(){
      this.$post('/', 'getContractTxResult', [this.hash])
        .then((response) => {
          //console.log(response);
          if (response.hasOwnProperty("result")) {
            if(this.hash==response.result.txHash){
              clearInterval(this.setIntervalResult);
              if(this.succType==1){
                localStorage.setItem("lockNum",this.lockNum);
              }
              this.$emit("dialogClose",8);
            }
          }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call7') + error, type: 'error', duration: 1000});
        });
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
